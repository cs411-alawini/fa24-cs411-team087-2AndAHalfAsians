from fastapi import APIRouter, Query, HTTPException, status
from pydantic import BaseModel
from src.db_connection import getDBCursor
from mysql.connector import errorcode, Error
from src.query_loader import load_query

router = APIRouter(
    prefix='/EVStation',
    tags=['EVStation']
)

class ResponseBody(BaseModel):
    message: str

@router.get('/getEVStations')
async def getEVStations(
    resultsLimit: int = Query(None, description='How many random results to return, if not set, returns all')
):
    
    print(resultsLimit)
    
    with getDBCursor() as cursor:
        
        params = {
            'resultsLimit': resultsLimit if resultsLimit else 2**32-1
        }
        
        cursor.execute(load_query('read_uncommitted'))
        cursor.execute(load_query('get_random_ev_stations'), params)
        
        return cursor.fetchall()
    
