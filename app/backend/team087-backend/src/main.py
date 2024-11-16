from fastapi import FastAPI, HTTPException, Query, Request
from fastapi.middleware.cors import CORSMiddleware
from typing import Union
import uvicorn
from src.db_connection import DatabaseConnectionPool, getDBCursor
from mysql.connector import errorcode, Error

from src.routers.testRouter import router as testRouter
from src.routers.ownsEVRouters import router as ownsEVRouter
from src.routers.plugsRouter import router as plugsRouter

from src.query_loader import QueryLoader
import importlib
import os

# Initialize the QueryLoader with the path to the queries folder
query_loader = QueryLoader(query_dir=os.path.join(os.path.dirname(__file__), "queries"))

tagsData = [
    {
        "name": "OwnsEV",
        "description": "All endpoints directly modifying the OwnsEV table",
    },
    {"name": "PlugInstance", "description": "Endpoints that relate to who owns an EV"},
]

app = FastAPI(
    title="EV Charging Station API",
    description="IDK",
    version="1.0.0",
    openapi_tags=tagsData,
)

origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Dynamically load routers
def include_all_routers(app: FastAPI, routers_dir: str = "src/routers"):
    """
    Dynamically discover and include routers from the routers directory.
    """
    for file in os.listdir(routers_dir):
        if file.endswith(".py") and file != "__init__.py":
            module_name = f"{routers_dir.replace('/', '.')}.{file[:-3]}"
            module = importlib.import_module(module_name)
            if hasattr(module, "router"):
                app.include_router(module.router)
                print(f"Included router: {module_name}")


include_all_routers(app)


# Define the API endpoints
@app.get("/")
def health(request: Request):
    return {
        "message": f"Application is running! Visit {str(request.url)}docs for endpoint access."
    }


# Endpoint: Get Compatible EV Stations
@app.get("/CompatibleStations/")
async def getCompatibleStations(
    latitude: float = Query(..., description="Latitude of first point", ge=-90, le=90),
    longitude: float = Query(
        ..., description="Longitude of first point", ge=-180, le=180
    ),
    distance_threshold: float = Query(..., description="Range to search for vehicles"),
    ev_id: int = Query(..., description="EV ID of the vehicle"),
):
    """
    Fetch all compatible EV Stations based on given latitude, longitude,
    distance threshold, and EV ID.
    """
    with getDBCursor() as cursor:
        params = {
            "latitude": latitude,
            "longitude": longitude,
            "distance_threshold": distance_threshold,
            "ev_id": ev_id,
        }
        try:
            # Load the "q1" query dynamically
            query = query_loader.load_query("compatible_stations_query")
            cursor.execute(query, params)
            results = cursor.fetchall()
        except Exception as e:
            raise HTTPException(
                status_code=500, detail=f"Error executing query: {str(e)}"
            )
    return results
