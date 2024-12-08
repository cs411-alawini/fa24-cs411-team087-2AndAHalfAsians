from fastapi import APIRouter, Query
from pydantic import BaseModel
from src.db_connection import getDBCursor
from src.query_loader import load_query
from src.utils import genericInsertQuery, genericUpdateQuery, genericReadQuery, genericDeleteQuery

router = APIRouter(
    prefix='/User',
    tags=['User']
)

class ResponseBody(BaseModel):
    message: str

TABLE = 'User'


@router.post(f'/Add{TABLE}/')
async def addUser(
    username: str = Query(..., description='username'),
    email: str = Query(..., description='email'),
    password: str = Query(..., description='password'),
    ssn: str = Query(..., description='ssn'),
    address: str = Query(..., description='address'),
    state: str = Query(..., description='state'),
    city: str = Query(..., description='city'),
    zip: int = Query(..., description='zip'),
    first_name: str = Query(..., description='first_name'),
    last_name: str = Query(..., description='last_name'),
    middle_initial: str = Query(None, description='middle_initial')
):
    
    params = {key: value for key, value in locals().items() if key != 'self'}

    with getDBCursor() as cursor:

        cursor.execute(load_query('read_committed'))
        cursor.execute(genericInsertQuery(table=TABLE, params=params), params)
        # Get the auto-incremented user_id with cursor.lastrowid
        user_id = cursor.lastrowid

    return await getUserByUserId(user_id=user_id)




@router.get(f'/Get{TABLE}ByUserId/')
async def getUserByUserId(
    user_id: int = Query(1, description='The user to get by id')
):
    
    params = {key: value for key, value in locals().items() if key != 'self'}

    with getDBCursor() as cursor:

        cursor.execute(load_query('read_committed'))
        cursor.execute(genericReadQuery(table=TABLE, key='user_id'), params)

        results = cursor.fetchall()

    return results


@router.get(f'/Get{TABLE}ByUsername/')
async def getUserByUsername(
    username: str = Query('WilMendez63', description='The user to get by username')
):
    
    params = {key: value for key, value in locals().items() if key != 'self'}

    with getDBCursor() as cursor:
        
        cursor.execute(load_query('read_committed'))
        cursor.execute(genericReadQuery(table=TABLE, key='username'), params)
        
        results = cursor.fetchall()

    return results


@router.put(f'/Update{TABLE}/')
async def updateUser(
    user_id: int = Query(..., description='user_id'),
    username: str = Query(..., description='username'),
    email: str = Query(..., description='email'),
    password: str = Query(..., description='password'),
    ssn: str = Query(..., description='ssn'),
    address: str = Query(..., description='address'),
    state: str = Query(..., description='state'),
    city: str = Query(..., description='city'),
    zip: int = Query(..., description='zip'),
    first_name: str = Query(..., description='first_name'),
    last_name: str = Query(..., description='last_name'),
    middle_initial: str = Query(..., description='middle_initial'),
    creation_date: str = Query(..., description='creation_date')
):
    
    updateParams = {key: value for key, value in locals().items() if key != 'self'}
    
    with getDBCursor() as cursor:
        
        # Construct an update query to only include non-None values
        UPDATE_QUERY = genericUpdateQuery(table=TABLE, key='user_id', params=updateParams)
        
        cursor.execute(load_query('serializable'))
        cursor.execute(UPDATE_QUERY, updateParams)

    return await getUserByUserId(user_id=user_id)


@router.delete(f'/Delete{TABLE}/')
async def deleteUser(
    user_id: int = Query(..., description='ID of the user to delete')
):
    
    deleteParams = {key: value for key, value in locals().items() if key != 'self'}

    with getDBCursor() as cursor:
        
        cursor.execute(load_query('serializable'))
        cursor.execute(genericDeleteQuery(table=TABLE, key='user_id'), deleteParams)
    
    return {'message': f'User with user_id {user_id} deleted successfully'}