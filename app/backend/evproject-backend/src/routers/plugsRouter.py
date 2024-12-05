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

@router.get('/GetPlugInstance')
async def getPlugInstance(
    instance_id: int = Query(..., description='The instance_id to get')
):
    with getDBCursor() as cursor:
        params = {
            'instance_id': instance_id
        }
        
        cursor.execute(load_query('read_committed'))
        cursor.execute(load_query('get_plug_instance'), params)
        
        results = cursor.fetchall()

    return results


@router.get('/GetPlugInstancesFromStation/')
async def getPlugInstancesFromStation(
    station_id: int = Query(..., description='EV Station ID to get instances from')
):

    with getDBCursor() as cursor:
        params = {
            'station_id': station_id
        }
        
        # Don't really care if we miss a single plug, plus it would be crazy rare
        cursor.execute(load_query('read_uncommitted'))
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
        
        # Inserts don't need anything special
        cursor.execute(load_query('read_uncommitted'))
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
async def updatePlugInstance(
    instance_id: int = Query(..., description='The instance_id of the PlugInstance to udpate'),
    type_id: int = Query(None, description='The type_id of the charger to add'),
    power_output: float = Query(None, description='Power output in kW of the charger'),
    in_use: bool = Query(None, description='Whether or not the instance is in use or not'),
    base_price: float = Query(None, description='The base price to start charging'),
    usage_price: float = Query(None, description='The cost to charge per kW/h')
):
    
    with getDBCursor() as cursor:
        
        updateParams = {
            'instance_id': instance_id,
            'type_id': type_id,
            'power_output': power_output,
            'in_use': in_use,
            'base_price': base_price,
            'usage_price': usage_price
        }
        
        filledFields = {k: v for k, v in updateParams.items() if v is not None}
        setClauses = [f'{field} = %({value})s' for field, value in filledFields.items()]
        
        # Construct an update query to only include non-None values
        UPDATE_QUERY = f'''
        UPDATE PlugInstances
        SET {', '.join(setClauses)}
        WHERE instance_id = %(instance_id)s
        '''
        
        cursor.execute(load_query('serializable'))
        cursor.execute(UPDATE_QUERY, updateParams)

    return await getPlugInstance(instance_id=instance_id)
    