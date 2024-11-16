from fastapi import APIRouter, Query, HTTPException, status
from pydantic import BaseModel
from src.db_connection import getDBCursor
from mysql.connector import errorcode, Error
from src.query_loader import load_query


router = APIRouter(
    prefix='/PlugInstance',
    tags=['PlugInstance']
)

class ResponseBody(BaseModel):
    message: str

@router.get('/GetPlugInstancesFromStation/')
async def getPlugInstancesFromStation(
    station_id: int = Query(..., description='EV Station ID to get instances from')
):

    with getDBCursor() as cursor:
        params = {
            'station_id': station_id
        }
        cursor.execute(load_query('get_plug_instances_from_station'), params)
        results = cursor.fetchall()

    return results

@router.post('/AddPlugInstance/')
async def addPlugInstance(
    station_id: int = Query(..., description='EV Station ID to get instances from'),
    type_id: int = Query(..., description='The type_id of the charger to add'),
    power_output: float = Query(..., description='Power output in kW of the charger'),
    in_use: bool = Query(..., description='Whether or not the instance is in use or not'),
    base_price: float = Query(..., description='The base price to start charging'),
    usage_price: float = Query(..., description='The cost to charge per kW/h')
):
    
    with getDBCursor() as cursor:

        # Insert PlugInstance normally using the auto-incremented instance_id
        insertionParams = {
            'type_id': type_id,
            'power_output': power_output,
            'in_use': in_use,
            'base_price': base_price,
            'usage_price': usage_price
        }
        
        cursor.execute(load_query('add_plug_instance'), insertionParams)
        instance_id = cursor.lastrowid
        
        
        # Attach PlugInstance to the station with a separate query
        hasPlugsParams = {
            'station_id': station_id,
            'instance_id': instance_id
        }
        cursor.execute(load_query('add_has_plugs'), hasPlugsParams)
        
        return await getPlugInstancesFromStation(station_id)


@router.put('/UpdatePlugInstance/')
async def updatePlugInstance():
    
    pass