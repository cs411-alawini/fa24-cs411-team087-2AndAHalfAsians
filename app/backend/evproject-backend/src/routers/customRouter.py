from fastapi import APIRouter, Query, HTTPException, status
from pydantic import BaseModel
from src.db_connection import getDBCursor
from mysql.connector import errorcode, Error
from src.query_loader import load_query

router = APIRouter(
    prefix='/CustomQueries',
    tags=['CustomQueries']
)

class ResponseBody(BaseModel):
    message: str
    



# Example local connection URL for this endpoint
# localhost:8080/CompatibleStations/?latutude=34.040539&longitude=-118.271387&distance_threshold=40&ev_id=34
# Example deployed connection URL
# http://localhost:8080/CompatibleStations/?latitude=34.040539&longitude=-118.271387&distance_threshold=40&ev_id=34
@router.get("/CompatibleStations/")
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
        cursor.execute(load_query('read_uncommitted'))
        query = load_query("compatible_stations_query")
        cursor.execute(query, params)
        
        results = []
        for row in cursor:
            results.append(row)
    return results


@router.get("/CongestionScore/")
async def getCongestionScore(
    latitude: float = Query(34.040539, description='Target latitude', ge=-90, le=90),
    longitude: float = Query(-118.271387, description='Target longitude', ge=-180, le=180),
    distance_threshold: float = Query(40, description='Range to consider for congestion'),
    hour_range: int = Query(2, description='How many hours to average over from the current hour'),
    current_hour: int = Query(14, description='The current hour of the day from 0-23')
):
    
    '''
    Gets a list of TrafficStation near a given latitude and longitude. Each TrafficStation contributes
    some "CongestionScore" based on how close it is to the given latitude and longitude. Average congestion
    for a given latitude and longitude can be computed by averaging all the CongestionScore values.
    '''
    
    with getDBCursor() as cursor:
        
        params = {
            'latitude': latitude,
            'longitude': longitude,
            'distance_threshold': distance_threshold,
            'hour_range': hour_range,
            'current_hour': current_hour
        }
        
        cursor.execute(load_query('get_congestion_scores'), params)
        
        return cursor.fetchall()


@router.get("/OwnersOfMultipleEVs/")
async def getCongestionScore():
    
    '''
    Gets a list of TrafficStation near a given latitude and longitude. Each TrafficStation contributes
    some "CongestionScore" based on how close it is to the given latitude and longitude. Average congestion
    for a given latitude and longitude can be computed by averaging all the CongestionScore values.
    '''
    
    with getDBCursor() as cursor:
        
        cursor.execute(load_query('get_owners_of_multiple_evs'))
        
        return cursor.fetchall()
    


@router.get("/GetEVStationsWithHighestNumberOfAvailablePlugs/")
async def getEVStationsWithHighestNumberOfAvailablePlugs(
    latitude: float = Query(34.040539, description='Target latitude', ge=-90, le=90),
    longitude: float = Query(-118.271387, description='Target longitude', ge=-180, le=180),
    distance_threshold: float = Query(40, description='Range to consider for EVStations')
):
    
    '''
    Gets a list of TrafficStation near a given latitude and longitude. Each TrafficStation contributes
    some "CongestionScore" based on how close it is to the given latitude and longitude. Average congestion
    for a given latitude and longitude can be computed by averaging all the CongestionScore values.
    '''
    
    with getDBCursor() as cursor:
        
        params = {
            'latitude': latitude,
            'longitude': longitude,
            'distance_threshold': distance_threshold
        }
        
        cursor.execute(load_query('get_evstations_with_highest_number_of_available_plugs'), params)
        
        return cursor.fetchall()

