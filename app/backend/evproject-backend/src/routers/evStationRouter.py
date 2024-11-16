from fastapi import APIRouter, Query, HTTPException, status
from pydantic import BaseModel
from src.customQueries import Queries
from src.db_connection import getDBCursor
from mysql.connector import errorcode, Error

router = APIRouter(
    prefix='/EVStation',
    tags=['EVStation']
)

@router.get('/getEVStation')
async def getEVStations():
    
    with getDBCursor() as cursor:
        
        cursor.execute(Queries.GET_RANDOM_EV_STATIONS)
        
        return cursor.fetchall()