from fastapi import APIRouter, Query
from pydantic import BaseModel
from src.db_connection import getDBCursor
from src.query_loader import load_query
from src.utils import haversine, softmax
import numpy as np

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
    latitude: float = Query(34.040539, description='Latitude of first point', ge=-90, le=90),
    longitude: float = Query(-118.271387, description='Longitude of first point', ge=-180, le=180),
    distance_threshold: float = Query(40, description='Range to search for vehicles'),
    ev_id: int = Query(34, description='ev_id of the vehicle'),
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
        
        # Get the parameters for the procedure itself
        procedureParams = {
            'latitude': latitude,
            'longitude': longitude,
            'distance_threshold': distance_threshold,
            'target_table': 'EVStation'
        }
        
        queryParams = {
            'ev_id': ev_id
        }
        
        # We don't really care too much about reading messy data here
        # Plus we really need to not block stuff since we're grabbing a bunch of records
        cursor.execute(load_query('read_committed'))
        cursor.execute(load_query("haversine_distances_procedure", query_path='queries/Custom'), procedureParams)
        cursor.execute(load_query("compatible_stations_query", query_path='queries/Custom'), queryParams)
        
        results = cursor.fetchall()
        
    return results

@router.get("/GetPlugInstanceStats/")
async def getPlugInstanceStats(
    latitude: float = Query(34.040539, description='Latitude of first point', ge=-90, le=90),
    longitude: float = Query(-118.271387, description='Longitude of first point', ge=-180, le=180),
    distance_threshold: float = Query(40, description='Range to search for vehicles'),
):
    '''
    An endpoint which gets all the PlugInstances within a range based on their type.
    
    Arguments:
        latitude: Current latitude
        longitude: Current longitude
        distance_threshold: How many km to return results from
        
    
    Returns:
        A list of records fetched meeting the constraints. 
        Returned attributes are defined from the Q5 returns.
    '''
    
    with getDBCursor() as cursor:
        
        # Get the parameters for the procedure itself
        procedureParams = {
            'latitude': latitude,
            'longitude': longitude,
            'distance_threshold': distance_threshold,
            'target_table': 'EVStation',
        }
        
        
        # We don't really care too much about reading messy data here
        # Plus we really need to not block stuff since we're grabbing a bunch of records
        cursor.execute(load_query('read_committed'))
        cursor.execute(load_query("haversine_distances_procedure", query_path='queries/Custom'), procedureParams)
        cursor.execute(load_query("get_stat_pluginstance", query_path='queries/Custom'))
        
        results = cursor.fetchall()

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
    
    Arguments:
        latitude: The latitude to search around
        longitude: The longitude to search around
        distance_threshold: The square radius to search (in km)
        hour_range: How many hours to average data over, we may want data from +/- 2 or 1 hour(s)
        current_hour: The current hour from 0-23
    
    Returns: 
        A set of TrafficStation records with an additional CongestionScore attribute for each station.
    '''
    
    with getDBCursor() as cursor:
        
        procedureParams = {
            'latitude': latitude,
            'longitude': longitude,
            'distance_threshold': distance_threshold,
            'target_table': 'TrafficStation'
        }
        
        queryParams = {
            'hour_range': hour_range,
            'current_hour': current_hour,
            'distance_threshold': distance_threshold,
        }
        
        cursor.execute(load_query('read_committed'))
        cursor.execute(load_query("haversine_distances_procedure", query_path='queries/Custom'), procedureParams)
        cursor.execute(load_query('get_congestion_scores', query_path='queries/Custom'), queryParams)

        return cursor.fetchall()


@router.get("/CongestionScoreForEVStations/")
async def getCongestionScore(
    latitude: float = Query(34.040539, description='Target latitude', ge=-90, le=90),
    longitude: float = Query(-118.271387, description='Target longitude', ge=-180, le=180),
    distance_threshold: float = Query(40, description='Range to consider for congestion'),
    hour_range: int = Query(2, description='How many hours to average over from the current hour'),
    current_hour: int = Query(14, description='The current hour of the day from 0-23'),
    max_congestion_value_range: float = Query(127, description='The max value of the congestion value returned for easy experimentaiton'),
    softmax_temp: float = Query(5, description='The temperature for the softmax when computing weights')
):
    
    '''
    Computes an estimated congestion score for the actual EVStation based on the congestion score
    for the TrafficStations. We don't actually have the congestion scores for EVStations since the
    TrafficStation and EVStations aren't in the same place, so we estimate the EVStation's congestion
    based on the CongestionScores from individual TrafficStations. 
    
    We do this by taking a weighted sum for each EVStation of the surrounding TrafficStations, if EVStation 1 
    is close to a very busy TrafficStation and is far from another busy TrafficStation, the close TrafficStation
    will contribute more weight.
    
    Nothing is returned if there are no nearby EVStations or TrafficStations
    
    Arguments: 
        latitude: The latitude to search around
        longitude: The longitude to search around
        distance_threshold: The square radius to search (in km)
        hour_range: How many hours to average data over, we may want data from +/- 2 or 1 hour(s)
        current_hour: The current hour from 0-23
        max_congestion_value_range: The max possible value to be returned for a congestion score
        softmax_temp: The 'temperature' of the softmax determines how smoothly the far away values fall off, low temps make it a cliff while high temps are gentle slopes
    '''
    
    with getDBCursor() as cursor:
        
        procedureParams = {
            'latitude': latitude,
            'longitude': longitude,
            'distance_threshold': distance_threshold,
            'target_table': 'TrafficStation'
        }
        
        queryParams = {
            'hour_range': hour_range,
            'current_hour': current_hour,
            'distance_threshold': distance_threshold,
        }
        
        cursor.execute(load_query('read_committed'))

        # Compute distances from current location to all TrafficStations and get congestion scores
        cursor.execute(load_query("haversine_distances_procedure", query_path='queries/Custom'), procedureParams)
        cursor.execute(load_query('get_congestion_scores', query_path='queries/Custom'), queryParams)
        trafficStationResults = cursor.fetchall()
        
        
        procedureParams = {
            'latitude': latitude,
            'longitude': longitude,
            'distance_threshold': distance_threshold,
            'target_table': 'EVStation' # Change target_table
        }
        
        # Compute coordinates for all EVStations in range of the current query
        cursor.execute(load_query("haversine_distances_procedure", query_path='queries/Custom'), procedureParams)
        cursor.execute(load_query('get_ev_stations_in_range', query_path='queries/Custom'))
        evStationResults = cursor.fetchall()
        
        # Extract latitude and longitude from EVStations
        evStationLatLong = np.array([(np.float32(s['latitude']), np.float32(s['longitude'])) for s in evStationResults])
        
        # Extract latitude and longitude info from trafficStations
        tLats = np.array([r['latitude'] for r in trafficStationResults], dtype=np.float32)
        tLongs = np.array([r['longitude'] for r in trafficStationResults], dtype=np.float32)
        congestionScores = np.array([r['CongestionScore'] for r in trafficStationResults])
        
        # Return nothing if we can't find anything
        if len(evStationResults) == 0 or len(trafficStationResults) == 0:
            return []
        
        weightedCongestionScores = np.zeros((len(evStationResults)))
        distances = haversine(tLats, tLongs, evStationLatLong[:, 0], evStationLatLong[:, 1])

        # Negate distances to give more weight to small distances
        # Also use temperature for smoother distribution
        weights = softmax(-distances, temp=softmax_temp)

        # Weight and sum congestion scores by new weights
        weightedCongestionScores = congestionScores @ weights.T

        weightedCongestionScores = np.interp(weightedCongestionScores,
                                                (np.min(weightedCongestionScores), np.max(weightedCongestionScores)),
                                                (1, max_congestion_value_range))

        # Update actual CongestionScore values in the results
        for r, wcs in zip(evStationResults, weightedCongestionScores):
            r['CongestionScore'] = wcs
        
        return evStationResults

        

    

@router.get("/OwnersOfMultipleEVs/")
async def getOwnersOfMultipleEvs():
    
    '''
    Gets a list of TrafficStation near a given latitude and longitude. Each TrafficStation contributes
    some "CongestionScore" based on how close it is to the given latitude and longitude. Average congestion
    for a given latitude and longitude can be computed by averaging all the CongestionScore values.
    
    Arguments:
        latitude: The latitude to search around
        longitude: The longitude to search around
        distance_threshold: The square radius to search (in km)
    '''
    
    with getDBCursor() as cursor:
        
        cursor.execute(load_query('read_committed'))
        cursor.execute(load_query('get_owners_of_multiple_evs', query_path='queries/Custom'))
        
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
    
    Arguments:
        latitude: The latitude to search around
        longitude: The longitude to search around
        distance_threshold: The square radius to search (in km)
    '''
    
    with getDBCursor() as cursor:
        
        params = {
            'latitude': latitude,
            'longitude': longitude,
            'distance_threshold': distance_threshold
        }
        
        # We actually want to get committed stuff here since we don't want to say a plug is available
        # when it actually isn't
        cursor.execute(load_query('read_committed'))
        cursor.execute(load_query('get_evstations_with_highest_number_of_available_plugs', query_path='queries/Custom'), params)
        
        return cursor.fetchall()
    

@router.get('/GetBestElectricVehiclesForTrip/')
async def getBestElectricVehiclesForTrip(
    city1_latitude:float = Query(34.0549, description='Start city lat', ge=-90, le=90),
    city1_longitude:float = Query(-118.2426, description='Start city long', ge=-180, le=180),
    city2_latitude:float = Query(37.7749, description='End city lat', ge=-90, le=90),
    city2_longitude:float = Query(-122.4194, description='End city long', ge=-180, le=180),
    distance_threshold: float = Query(10, description='Range to consider for EVStations')
):
    '''
    Gets some results about the different EVs we have if you want to go from one city to another.
    Returns results based on which car is the most economical based on the charging prices in an area.
    
    Arguments:
        city1_latitude: Latitude of city 1
        city1_longitude: Longitude of city 1
        city2_latitude: Latitude of city 2
        city2_longitude: Longitude of city 2
        distance_threshold: The square radius to search (in km)
    '''

    params = {key: value for key, value in locals().items() if key != 'self'}

    with getDBCursor() as cursor:
        
        cursor.execute(load_query('read_committed'))
        cursor.execute(load_query('get_best_evs_for_trip', query_path='queries/Custom'), params)
        
        return cursor.fetchall()