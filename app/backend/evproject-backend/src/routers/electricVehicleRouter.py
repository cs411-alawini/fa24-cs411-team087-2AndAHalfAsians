from fastapi import APIRouter, Query, HTTPException, status
from pydantic import BaseModel
from src.db_connection import getDBCursor
from mysql.connector import errorcode, Error
from src.query_loader import load_query
from src.utils import genericInsertQuery, genericUpdateQuery, genericDeleteQuery, genericReadQuery

router = APIRouter(
    prefix='/ElectricVehicle',
    tags=['ElectricVehicle']
)

class ResponseBody(BaseModel):
    message: str

# Define a base table for simplicity
TABLE = 'ElectricVehicle'

@router.post(f'/Add{TABLE}/')
async def addElectricVehicle(
    make: str = Query(..., description='make'),
    model: str = Query(..., description='model'),
    plug_type: int = Query(..., description='plug_type'),
    range_km: float = Query(..., description='range_km'),
    battery_capacity: float = Query(..., description='battery_capacity')
):
    
    params = {key: value for key, value in locals().items() if key != 'self'}

    with getDBCursor() as cursor:

        cursor.execute(load_query('read_uncommitted'))
        cursor.execute(genericInsertQuery(table=TABLE, params=params), params)
        ev_id = cursor.lastrowid

    return await getElectricVehicleByEvId(ev_id=ev_id)



@router.get(f'/Get{TABLE}ByEvId/')
async def getElectricVehicleByEvId(
    ev_id: int = Query(1, description='The EV to get by id')
):
    
    params = {key: value for key, value in locals().items() if key != 'self'}

    with getDBCursor() as cursor:

        cursor.execute(load_query('read_committed'))
        cursor.execute(genericReadQuery(table=TABLE, key='ev_id'), params)

        results = cursor.fetchall()

    return results


@router.get(f'/GetAll{TABLE}s/')
async def getAllElectricVehicles():
    
    with getDBCursor() as cursor:
        
        cursor.execute(load_query('read_uncommitted'))
        cursor.execute(load_query('get_all_electric_vehicles', query_path='queries/ElectricVehicle'))
        
        results = cursor.fetchall()

    return results


@router.put(f'/Update{TABLE}/')
async def updateElectricVehicle(
    ev_id: int = Query(..., description='ev_id'),
    make: str = Query(..., description='make'),
    model: str = Query(..., description='model'),
    plug_type: int = Query(..., description='plug_type'),
    range_km: float = Query(..., description='range_km'),
    battery_capacity: float = Query(..., description='battery_capacity')
):
    
    updateParams = {key: value for key, value in locals().items() if key != 'self'}
    
    with getDBCursor() as cursor:
        
        UPDATE_QUERY = genericUpdateQuery(table=TABLE, key='ev_id', params=updateParams)
        
        cursor.execute(load_query('serializable'))
        cursor.execute(UPDATE_QUERY, updateParams)

    return await getElectricVehicleByEvId(ev_id=ev_id)


@router.delete(f'/Delete{TABLE}/')
async def deleteElectricVehicle(
    ev_id: int = Query(..., description='ev_id of the vehicle to delete')
):
    
    deleteParams = {key: value for key, value in locals().items() if key != 'self'}

    with getDBCursor() as cursor:
        
        cursor.execute(load_query('serializable'))
        DELETE_QUERY = genericDeleteQuery(TABLE, key='ev_id')
        cursor.execute(DELETE_QUERY, deleteParams)
    
    return {'message': f'{TABLE} with ev_id {ev_id} deleted successfully'}