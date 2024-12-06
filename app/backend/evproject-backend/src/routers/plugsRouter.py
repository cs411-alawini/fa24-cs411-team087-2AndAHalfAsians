from fastapi import APIRouter, Query, HTTPException, status
from pydantic import BaseModel
from src.db_connection import getDBCursor
from mysql.connector import errorcode, Error
from src.query_loader import load_query
from src.utils import genericReadQuery, genericInsertQuery, genericDeleteQuery, genericUpdateQuery

router = APIRouter(
    prefix='/PlugInstance',
    tags=['PlugInstance']
)

class ResponseBody(BaseModel):
    message: str

TABLE = 'PlugInstance'

@router.get(f'/Get{TABLE}')
async def getPlugInstance(
    instance_id: int = Query(..., description='The instance_id to get')
):
    params = {key: value for key, value in locals().items() if key != 'self'}
    with getDBCursor() as cursor:
        cursor.execute(load_query('read_committed'))
        cursor.execute(genericReadQuery(table=TABLE, key='instance_id'), params)
        results = cursor.fetchall()
    return results


@router.get(f'/Get{TABLE}sFromStation/')
async def getPlugInstancesFromStation(
    station_id: int = Query(..., description='EV Station ID to get instances from')
):
    params = {key: value for key, value in locals().items() if key != 'self'}
    with getDBCursor() as cursor:
        # Don't really care if we miss a single plug, plus it would be crazy rare
        cursor.execute(load_query('read_uncommitted'))
        cursor.execute(load_query('get_plug_instances_from_station', query_path='queries/PlugInstance'), params)
        results = cursor.fetchall()
    return results


@router.post(f'/Add{TABLE}/')
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
        
        # Inserts don't need anything special
        cursor.execute(load_query('read_uncommitted'))
        cursor.execute(genericInsertQuery(table=TABLE, params=insertionParams), insertionParams)
        instance_id = cursor.lastrowid
        
        # Attach PlugInstance to the station with a separate query
        hasPlugsParams = {
            'station_id': station_id,
            'instance_id': instance_id
        }
        cursor.execute(genericInsertQuery(table='HasPlugs', params=hasPlugsParams), hasPlugsParams)
        
        return await getPlugInstancesFromStation(station_id)


@router.put(f'/Update{TABLE}/')
async def updatePlugInstance(
    instance_id: int = Query(..., description='The instance_id of the PlugInstance to udpate'),
    type_id: int = Query(..., description='The type_id of the charger to add'),
    power_output: float = Query(..., description='Power output in kW of the charger'),
    in_use: bool = Query(..., description='Whether or not the instance is in use or not'),
    base_price: float = Query(..., description='The base price to start charging'),
    usage_price: float = Query(..., description='The cost to charge per kW/h')
):
    params = {key: value for key, value in locals().items() if key != 'self'}
    with getDBCursor() as cursor:
        # Construct an update query to only include non-None values
        cursor.execute(load_query('serializable'))
        UPDATE_QUERY = genericUpdateQuery(table=TABLE, key='instance_id', params=params)
        cursor.execute(UPDATE_QUERY, params)
    return await getPlugInstance(instance_id=instance_id)

