import os
from fastapi import APIRouter
from src.db_connection import getDBCursor
from src.query_loader import QueryLoader

# Initialize QueryLoader with the directory containing your SQL files
query_loader = QueryLoader(query_dir=os.path.join(os.path.dirname(__file__), "../queries"))

router = APIRouter(
    prefix='/EVStation',
    tags=['EVStation']
)

@router.get('/getEVStation')
async def getEVStations():
    """
    Endpoint to fetch EV Stations.
    """
    with getDBCursor() as cursor:
        # Dynamically load the query
        query = query_loader.load_query("get_random_ev_stations")
        cursor.execute(query)
        return cursor.fetchall()
