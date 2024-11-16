from fastapi import APIRouter, Query, HTTPException, status
from pydantic import BaseModel
from src.db_connection import getDBCursor
from mysql.connector import errorcode, Error
from src.query_loader import QueryLoader
import os

# Initialize QueryLoader
query_loader = QueryLoader(query_dir=os.path.join(os.path.dirname(__file__), "../queries"))

router = APIRouter(
    prefix='/OwnsEV',
    tags=['OwnsEV']
)

class ResponseBody(BaseModel):
    message: str

@router.get('/GetOwnedVehicles/')
async def getOwnedVehicles(
    user_id: int = Query(..., description='ID of the user')
):
    """
    Endpoint to get all vehicles owned by a user.

    Args:
        user_id (int): ID of the user.

    Returns:
        List of owned vehicles.
    """
    with getDBCursor() as cursor:
        params = {'user_id': user_id}
        query = query_loader.load_query("get_owned_vehicles")
        cursor.execute(query, params)
        return cursor.fetchall()


@router.put('/UpdateOwnedVehicles/')
async def updateOwnedVehicle(
    user_id: int = Query(..., description='ID of the user'),
    previous_ev_id: int = Query(..., description='The ev_id of the vehicle to update'),
    new_ev_id: int = Query(..., description='New value for the owned ev_id')
):
    """
    Update a user's owned vehicle.

    Args:
        user_id (int): User's ID.
        previous_ev_id (int): ev_id to update.
        new_ev_id (int): New value of ev_id.

    Returns:
        Updated list of user's owned EVs.
    """
    with getDBCursor() as cursor:
        cursor.execute(query_loader.load_query("serializable"))
        params = {
            'user_id': user_id,
            'previous_ev_id': previous_ev_id,
            'new_ev_id': new_ev_id,
        }
        try:
            query = query_loader.load_query("update_owned_vehicle")
            cursor.execute(query, params)
        except Error as e:
            if e.errno == errorcode.ER_NO_REFERENCED_ROW_2:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail={
                        "message": "Invalid ev_id provided",
                        "error_code": "ER_NO_REFERENCED_ROW_2 (Foreign key constraint)",
                        "details": {"constraint": "ev_id", "invalid_id": new_ev_id},
                    },
                )
            if e.errno == errorcode.ER_DUP_ENTRY:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail={
                        "message": "Duplicate entry: ev_id already exists",
                        "error_code": "ER_DUP_ENTRY (Primary key constraint)",
                        "details": {"constraint": "ev_id", "invalid_id": new_ev_id},
                    },
                )
            raise e

        return await getOwnedVehicles(user_id=user_id)


@router.post('/InsertOwnedVehicle/')
async def insertOwnedVehicle(
    user_id: int = Query(..., description='ID of the user'),
    ev_id: int = Query(..., description='ID of the new vehicle to add')
):
    """
    Add a new EV to a user's owned vehicles.

    Args:
        user_id (int): User's ID.
        ev_id (int): ID of EV to add.

    Returns:
        Updated list of user's owned EVs.
    """
    with getDBCursor() as cursor:
        cursor.execute(query_loader.load_query("read_uncommitted"))
        params = {'user_id': user_id, 'ev_id': ev_id}
        try:
            query = query_loader.load_query("insert_owned_vehicle")
            cursor.execute(query, params)
        except Error as e:
            if e.errno == errorcode.ER_NO_REFERENCED_ROW_2:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail={
                        "message": "Invalid ev_id provided",
                        "error_code": "ER_NO_REFERENCED_ROW_2 (Foreign key constraint)",
                        "details": {"constraint": "ev_id", "invalid_id": ev_id},
                    },
                )
            if e.errno == errorcode.ER_DUP_ENTRY:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail={
                        "message": "Duplicate entry: user already owns this EV type",
                        "error_code": "ER_DUP_ENTRY (Primary key constraint)",
                        "details": {"constraint": "ev_id", "invalid_id": ev_id},
                    },
                )
            raise e

    return await getOwnedVehicles(user_id)


@router.delete('/DeleteOwnedVehicle/')
async def deleteOwnedVehicle(
    user_id: int = Query(..., description='ID of the user'),
    ev_id: int = Query(..., description='ID of the EV to delete'),
):
    """
    Delete an EV from a user's owned vehicles.

    Args:
        user_id (int): User's ID.
        ev_id (int): EV ID to delete.

    Returns:
        Updated list of user's owned EVs.
    """
    with getDBCursor() as cursor:
        cursor.execute(query_loader.load_query("serializable"))
        params = {'user_id': user_id, 'ev_id': ev_id}
        query = query_loader.load_query("delete_owned_vehicle")
        cursor.execute(query, params)

    return await getOwnedVehicles(user_id)
