from fastapi import FastAPI, Query, HTTPException, status, Request
from fastapi.middleware.cors import CORSMiddleware
from typing import Union
import uvicorn
from src.db_connection import DatabaseConnectionPool, getDBCursor
from src.customQueries import Queries
from mysql.connector import errorcode, Error

from src.routers.testRouter import router as testRouter
from src.routers.ownsEVRouters import router as ownsEVRouter
from src.routers.plugsRouter import router as plugsRouter
from src.routers.evStationRouter import router as evStationRouter
import os

# Uncomment this to debug locally
# if os.getenv("ENV") != "production":
#     import debugpy

#     debugpy.listen(("0.0.0.0", 5678))
#     debugpy.wait_for_client()

# TODO: Should we pass in a cursor as an argument to nested calls? 
#   If we call a(a(a(a(params)))) are we making 4 separate cursors which each have their own
#   connection? If so we could easily run out so it may be better to pass in the existing cursor
#   if possible. If we do this, we would have to be more careful about transaction and failure management

# TODO: All these queries will probably explode, should add better error handling
# TODO: Refactor this into separate routes? It was pretty rough getting the imports to work though with GCP

tagsData = [
    {
        'name': 'OwnsEV',
        'description': 'All endpoints directly modifying the OwnsEV table'
    },
    {
        'name': 'PlugInstance',
        'description': 'Endpoints that relate to who owns an EV'
    },
    {
        'name': 'EVStation',
        'description': 'Endpoints for interacting with the EVStation table'
    }
]

app = FastAPI(
    title='EV Charging Station API',
    description='IDK',
    version='0.0.0.0.0.0.0.0.0.1.2',
    openapi_tags=tagsData
)

origins = [
    "*"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(ownsEVRouter) # No need to include the prefix kwarg since we defined it in the ownsEVRouter router
app.include_router(plugsRouter)
app.include_router(evStationRouter)
app.include_router(testRouter, prefix='/testRouter')

# Define the API endpoints
@app.get('/')
def health(request: Request):
    return {
        "message": f"Application is running! Visit {str(request.url)}docs for endpoint access."
    }


# Example local connection URL for this endpoint
# localhost:8080/CompatibleStations/?latutude=34.040539&longitude=-118.271387&distance_threshold=40&ev_id=34
# Example deployed connection URL
# http://localhost:8080/CompatibleStations/?latitude=34.040539&longitude=-118.271387&distance_threshold=40&ev_id=34
@app.get("/CompatibleStations/")
async def getCompatibleStations(
    latitude: float = Query(..., description='Latitude of first point', ge=-90, le=90),
    longitude: float = Query(..., description='Longitude of first point', ge=-180, le=180),
    distance_threshold: float = Query(..., description='Range to search for vehicles'),
    ev_id: int = Query(..., description='ev_id of the vehicle'),
):
    '''
    An endpoint which gets all compatible EV Stations with some given ev_id, a
    location with lat/long and a distance threshold to search over.
    
    Arguments:
        latitude: Current latitude
        longitude: Current longitude
        distance_threshold: How many km to return results from
        ev_id: EV ID to filter for compatible plugs
    
    Returns:
        A list of records fetched meeting the constraints. 
        Returned attributes are defined from the Q1 returns.
    '''
    
    with getDBCursor() as cursor:
        params = {
            'latitude': latitude,
            'longitude': longitude,
            'distance_threshold': distance_threshold,
            'ev_id': ev_id
        }
        # We don't really care too much about reading messy data here
        cursor.execute(Queries.READ_UNCOMMITTED)
        cursor.execute(Queries.Q1, params)
        results = []
        for row in cursor:
            results.append(row)
    return results














# Run me with:
# uvicorn src.main:app --host 0.0.0.0 --port 8080 --reload
# Go to localhost:8080/docs to get an interactive way to mess with the endpoints
if __name__ == "__main__":
    DatabaseConnectionPool._initPool()
    port = 8080
    uvicorn.run("src.main:app", host="0.0.0.0", port=port, reload=os.getenv("ENV") != "production")
    
    print('Application started!')