from fastapi import APIRouter, Query, HTTPException, status
from pydantic import BaseModel
from src.db_connection import getDBCursor
from mysql.connector import errorcode, Error
from src.query_loader import load_query
from src.utils import genericInsertQuery, genericReadQuery, genericUpdateQuery, genericDeleteQuery

router = APIRouter(
    prefix='/EVStation',
    tags=['EVStation']
)

class ResponseBody(BaseModel):
    message: str

TABLE = 'EVStation'

@router.get(f'/get{TABLE}s')
async def getEVStations(
    resultsLimit: int = Query(None, description='How many random results to return, if not set, returns all')
):
        
    with getDBCursor() as cursor:
        
        params = {
            'resultsLimit': resultsLimit if resultsLimit else 2**32-1
        }
        
        cursor.execute(load_query('read_uncommitted'))
        cursor.execute(load_query('get_random_ev_stations', query_path='queries/Misc'), params)
        
        return cursor.fetchall()
    
@router.get(f'/get{TABLE}')
async def getEVStation(
    station_id: int = Query(..., description='The station_id of the station to get')
):
    params = {key: value for key, value in locals().items() if key != 'self'}
    with getDBCursor() as cursor:
        
        GET_QUERY = genericReadQuery(table=TABLE, key='station_id')
        cursor.execute(load_query('read_committed'))
        cursor.execute(GET_QUERY, params)
        
    return cursor.fetchall()
