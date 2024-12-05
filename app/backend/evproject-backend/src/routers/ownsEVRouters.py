from fastapi import APIRouter, Query, HTTPException, status
from pydantic import BaseModel
from src.db_connection import getDBCursor
from mysql.connector import errorcode, Error
from src.query_loader import load_query

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
    '''
    An endpoint which gets all vehicles owned by a user
    
    Arguments:
        user_id: The user id
    '''
    
    with getDBCursor() as cursor:
        params = {
            'user_id': user_id
        }
        
        cursor.execute(load_query('read_committed'))
        cursor.execute(load_query('get_owned_vehicles'), params)
        return cursor.fetchall()


@router.put('/UpdateOwnedVehicles/')
async def updateOwnedVehicle(
    user_id: int = Query(..., description='ID of the user'),
    previous_ev_id: int = Query(..., description='The ev_id of the vehicle to update'),
    new_ev_id: int = Query(..., description='New value for the owned ev_id')
):
    '''
    Allows you to update a user's owned vehicle.
    
    Arguments:
        user_id: User's ID
        previous_ev_id: ev_id to update
        new_ev_id: New value of ev_id
    
    Returns:
        All of the user's owned EVs which reflects the updated change
    '''
    
    with getDBCursor() as cursor:
        params = {
            'user_id': user_id,
            'previous_ev_id': previous_ev_id,
            'new_ev_id': new_ev_id
        }
        
        try:
            # Perform update and return new results
            cursor.execute(load_query('serializable'))
            cursor.execute(load_query('update_owned_vehicle'), params)
        
        # Need to handle issues like if someone tries to enter a non-existent ev_id
        except Error as e:
            if e.errno == errorcode.ER_NO_REFERENCED_ROW_2:
                raise HTTPException(
                    status_code = status.HTTP_400_BAD_REQUEST,
                    detail = {
                        "message": "Invalid ev_id provided",
                        "error_code": "ER_NO_REFERENCED_ROW_2 (Foreign key constraint)",
                        "details": {
                            "constraint": "ev_id",
                            "invalid_id": new_ev_id
                        }
                    }
                )
            if e.errno == errorcode.ER_DUP_ENTRY:
                raise HTTPException(
                    status_code = status.HTTP_400_BAD_REQUEST,
                    detail = {
                        "message": "Duplicate entry: ev_id already exists",
                        "error_code": "ER_DUP_ENTRY (Primary key constraint)",
                        "details": {
                            "constraint": "ev_id",
                            "invalid_id": new_ev_id
                        }
                    }
                )
            raise e

        return await getOwnedVehicles(user_id=user_id)


@router.post('/InsertOwnedVehicle/')
async def insertOwnedVehicle(
    user_id: int = Query(..., description='ID of the user'),
    ev_id:  int = Query(..., description='ID of the new vehicle to add')
):
    '''
    Allows you to add a new EV to a user's owned vehicle types.
    
    Arguments:
        user_id: User's ID
        ev_id: ID of EV to add
    
    Returns:
        All of the user's owned EVs which reflects the updated change
    '''
    
    with getDBCursor() as cursor:
    
        params = {
            'user_id': user_id,
            'ev_id': ev_id
        }
        
        try:
            # We should be able to insert this whenever, nothing else is probably going to be affected
            cursor.execute(load_query('read_uncommitted'))
            cursor.execute(load_query('insert_owned_vehicle'), params)
            
        # Need to handle issues like if someone tries to enter a non-existent ev_id
        except Error as e:
            if e.errno == errorcode.ER_NO_REFERENCED_ROW_2:
                raise HTTPException(
                    status_code = status.HTTP_400_BAD_REQUEST,
                    detail = {
                        "message": "Invalid ev_id provided",
                        "error_code": "ER_NO_REFERENCED_ROW_2 (Foreign key constraint)",
                        "details": {
                            "constraint": "ev_id",
                            "invalid_id": ev_id
                        }
                    }
                )
            if e.errno == errorcode.ER_DUP_ENTRY:
                raise HTTPException(
                    status_code = status.HTTP_400_BAD_REQUEST,
                    detail = {
                        "message": "Duplicate entry: user already owns this EV type",
                        "error_code": "ER_DUP_ENTRY (Primary key constraint)",
                        "details": {
                            "constraint": "ev_id",
                            "invalid_id": ev_id
                        }
                    }
                )
            raise e
    
    return await getOwnedVehicles(user_id)


@router.delete('/DeleteOwnedVehicle/')
async def deleteOwnedVehicle(
    user_id: int = Query(..., description='ID of the user'),
    ev_id: int = Query(..., description='ID of the EV to delete'),
):
    with getDBCursor() as cursor:
    
        params = {
            'user_id': user_id,
            'ev_id': ev_id
        }
        
        cursor.execute(load_query('serializable'))
        cursor.execute(load_query('delete_owned_vehicle'), params)
    
    return await getOwnedVehicles(user_id)