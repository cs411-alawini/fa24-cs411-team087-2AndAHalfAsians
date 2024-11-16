from fastapi import APIRouter, Query, HTTPException
from pydantic import BaseModel
from src.db_connection import getDBCursor
from mysql.connector import Error
from src.query_loader import QueryLoader
import os

# Initialize QueryLoader
query_loader = QueryLoader(query_dir=os.path.join(os.path.dirname(__file__), "../queries"))

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
    """
    Fetch all plug instances for a specific station.

    Args:
        station_id (int): ID of the EV station.

    Returns:
        List of plug instances at the specified station.
    """
    with getDBCursor() as cursor:
        params = {'station_id': station_id}
        query = query_loader.load_query("get_plug_instances_from_station")
        cursor.execute(query, params)
        results = cursor.fetchall()
    return results


@router.post('/AddPlugInstance/')
async def addPlugInstance(
    station_id: int = Query(..., description='EV Station ID to attach the plug instance to'),
    type_id: int = Query(..., description='The type_id of the charger to add'),
    power_output: float = Query(..., description='Power output in kW of the charger'),
    in_use: bool = Query(..., description='Whether or not the instance is currently in use'),
    base_price: float = Query(..., description='The base price to start charging'),
    usage_price: float = Query(..., description='The cost to charge per kW/h')
):
    """
    Add a new plug instance to a specific station.

    Args:
        station_id (int): ID of the station to attach the plug instance to.
        type_id (int): Type ID of the charger.
        power_output (float): Power output in kW.
        in_use (bool): Whether the plug instance is currently in use.
        base_price (float): Base price to start charging.
        usage_price (float): Cost to charge per kW/h.

    Returns:
        Updated list of plug instances at the station.
    """
    with getDBCursor() as cursor:
        try:
            # Insert new PlugInstance
            insertionParams = {
                'type_id': type_id,
                'power_output': power_output,
                'in_use': in_use,
                'base_price': base_price,
                'usage_price': usage_price,
            }
            insert_query = query_loader.load_query("add_plug_instance")
            cursor.execute(insert_query, insertionParams)
            instance_id = cursor.lastrowid

            # Link the new PlugInstance to the station
            hasPlugsParams = {'station_id': station_id, 'instance_id': instance_id}
            link_query = query_loader.load_query("add_has_plugs")
            cursor.execute(link_query, hasPlugsParams)

            # Return updated list of plug instances
            return await getPlugInstancesFromStation(station_id)

        except Error as e:
            raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


@router.put('/UpdatePlugInstance/')
async def updatePlugInstance():
    """
    Placeholder for updating plug instance functionality.
    """
    pass
