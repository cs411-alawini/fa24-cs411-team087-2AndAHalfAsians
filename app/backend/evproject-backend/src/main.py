from fastapi import FastAPI, Query, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from typing import Union
import socket
import uvicorn
from src.db_connection import DatabaseConnectionPool, getDBCursor
from src.customQueries import Queries
from src.smokeTest import router as smoke_test_router
from mysql.connector import errorcode, Error
import os

# Uncomment this to debug locally
# if os.getenv("ENV") != "production":
#     import debugpy

#     debugpy.listen(("0.0.0.0", 5678))
#     debugpy.wait_for_client()


app = FastAPI()

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



app.include_router(smoke_test_router, prefix="/smoke-test")

# Define the API endpoints
@app.get('/')
def health():
    return {
        "message": "OK 🚀"
    }

@app.get("/items/{item_id}")
def read_item(item_id: int, q: Union[str, None] = None):
    return {"item_id": item_id, "q": q}

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


@app.get('/OwnedVehicles/')
async def getOwnedVehicles(
    user_id: int = Query(..., description='ID of the user')
):
    '''
    An endpoint which gets all vehicles owned by a user
    
    Arguments:
        user_id: The user id
    '''
    
    with getDBCursor() as cursor:
        params = {
            'user_id': user_id
        }
        
        cursor.execute(Queries.GET_OWNED_VEHICLES, params)
        return cursor.fetchall()


@app.put('/UpdateOwnedVehicles/')
async def updateOwnedVehicle(
    user_id: int = Query(..., description='ID of the user'),
    previous_ev_id: int = Query(..., description='The ev_id of the vehicle to update'),
    new_ev_id: int = Query(..., description='New value for the owned ev_id')
):
    '''
    Allows you to update a user's owned vehicle.
    
    Arguments:
        user_id: User's ID
        previous_ev_id: ev_id to update
        new_ev_id: New value of ev_id
    
    Returns:
        All of the user's owned EVs which reflects the updated change
    '''
    
    with getDBCursor() as cursor:
        cursor.execute(Queries.SERIALIZABLE)
        params = {
            'user_id': user_id,
            'previous_ev_id': previous_ev_id,
            'new_ev_id': new_ev_id
        }
        
        try:
            # Perform update and return new results
            cursor.execute(Queries.UPDATE_OWNED_VEHICLE, params)
        
        # Need to handle issues like if someone tries to enter a non-existent ev_id
        except Error as e:
            if e.errno == errorcode.ER_NO_REFERENCED_ROW_2:
                raise HTTPException(
                    status_code = status.HTTP_400_BAD_REQUEST,
                    detail = {
                        "message": "Invalid ev_id provided",
                        "error_code": "ER_NO_REFERENCED_ROW_2 (Foreign key constraint)",
                        "details": {
                            "constraint": "ev_id",
                            "invalid_id": new_ev_id
                        }
                    }
                )
            if e.errno == errorcode.ER_DUP_ENTRY:
                raise HTTPException(
                    status_code = status.HTTP_400_BAD_REQUEST,
                    detail = {
                        "message": "Duplicate entry: ev_id already exists",
                        "error_code": "ER_DUP_ENTRY (Primary key constraint)",
                        "details": {
                            "constraint": "ev_id",
                            "invalid_id": new_ev_id
                        }
                    }
                )

        return await getOwnedVehicles(user_id=user_id)


@app.post('/InsertOwnedVehicle/')
async def insertOwnedVehicle(
    user_id: int = Query(..., description='ID of the user'),
    ev_id:  int = Query(..., description='ID of the new vehicle to add')
):
    '''
    Allows you to add a new EV to a user's owned vehicle types.
    
    Arguments:
        user_id: User's ID
        ev_id: ID of EV to add
    
    Returns:
        All of the user's owned EVs which reflects the updated change
    '''
    
    with getDBCursor() as cursor:
        # We should be able to insert this whenever, nothing else is probably going to be affected
        cursor.execute(Queries.READ_UNCOMMITTED)
    
        params = {
            'user_id': user_id,
            'ev_id': ev_id
        }
        
        try:
            cursor.execute(Queries.INSERT_OWNED_VEHICLE, params)
            
        # Need to handle issues like if someone tries to enter a non-existent ev_id
        except Error as e:
            if e.errno == errorcode.ER_NO_REFERENCED_ROW_2:
                raise HTTPException(
                    status_code = status.HTTP_400_BAD_REQUEST,
                    detail = {
                        "message": "Invalid ev_id provided",
                        "error_code": "ER_NO_REFERENCED_ROW_2 (Foreign key constraint)",
                        "details": {
                            "constraint": "ev_id",
                            "invalid_id": ev_id
                        }
                    }
                )
            if e.errno == errorcode.ER_DUP_ENTRY:
                raise HTTPException(
                    status_code = status.HTTP_400_BAD_REQUEST,
                    detail = {
                        "message": "Duplicate entry: user already owns this EV type",
                        "error_code": "ER_DUP_ENTRY (Primary key constraint)",
                        "details": {
                            "constraint": "ev_id",
                            "invalid_id": ev_id
                        }
                    }
                )
    
    return await getOwnedVehicles(user_id)


@app.delete('/DeleteOwnedVehicle/')
async def deleteOwnedVehicle(
    user_id: int = Query(..., description='ID of the user'),
    ev_id: int = Query(..., description='ID of the EV to delete'),
):
    with getDBCursor() as cursor:
    
        params = {
            'user_id': user_id,
            'ev_id': ev_id
        }
        
        cursor.execute(Queries.SERIALIZABLE)
        cursor.execute(Queries.DELETE_OWNED_VEHICLE, params)
    
    return await getOwnedVehicles(user_id)

# Run me with:
# uvicorn src.main:app --host 0.0.0.0 --port 8080 --reload
if __name__ == "__main__":
    DatabaseConnectionPool._initPool()
    port = 8080
    uvicorn.run("src.main:app", host="0.0.0.0", port=port, reload=os.getenv("ENV") != "production")
    
    print('Application started!')