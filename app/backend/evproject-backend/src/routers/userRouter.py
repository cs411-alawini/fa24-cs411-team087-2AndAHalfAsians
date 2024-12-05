from fastapi import APIRouter, Query, HTTPException, status
from pydantic import BaseModel
from src.db_connection import getDBCursor
from mysql.connector import errorcode, Error
from src.query_loader import load_query
from src.utils import genericInsertQuery

router = APIRouter(
    prefix='/User',
    tags=['User']
)

class ResponseBody(BaseModel):
    message: str


@router.post('/AddUser/')
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

        cursor.execute(load_query('read_uncommitted'))
        cursor.execute(genericInsertQuery('User', argumentsDict=params), params)
        user_id = cursor.lastrowid

    return await getUserByUserId(user_id=user_id)




@router.get('/GetUserByUserId')
async def getUserByUserId(
    user_id: int = Query(1, description='The user to get by id')
):
    
    params = {key: value for key, value in locals().items() if key != 'self'}

    with getDBCursor() as cursor:

        cursor.execute(load_query('read_committed'))
        cursor.execute(load_query('get_user_by_user_id', query_path='queries/User'), params)

        results = cursor.fetchall()

    return results


@router.get('/GetUserByUsername')
async def getUserByUsername(
    username: str = Query('WilMendez63', description='The user to get by username')
):
    
    params = {key: value for key, value in locals().items() if key != 'self'}

    with getDBCursor() as cursor:
        
        cursor.execute(load_query('read_committed'))
        cursor.execute(load_query('get_user_by_username', query_path='queries/User'), params)
        
        results = cursor.fetchall()

    return results


@router.put('/UpdateUser/')
async def updateUser(
    user_id: int = Query(1, description='user_name'),
    username: str = Query(None, description='username'),
    email: str = Query(None, description='email'),
    password: str = Query(None, description='password'),
    ssn: str = Query(None, description='ssn'),
    address: str = Query(None, description='address'),
    state: str = Query(None, description='state'),
    city: str = Query(None, description='city'),
    zip: int = Query(None, description='zip'),
    first_name: str = Query(None, description='first_name'),
    last_name: str = Query(None, description='last_name'),
    middle_initial: str = Query(None, description='middle_initial'),
    creation_date: str = Query(None, description='creation_date')
):
    
    updateParams = {key: value for key, value in locals().items() if key != 'self'}
    
    with getDBCursor() as cursor:
        
        filledFields = {k: v for k, v in updateParams.items() if v is not None}
        setClauses = [f'{field} = %({value})s' for field, value in filledFields.items()]
        
        # Construct an update query to only include non-None values
        UPDATE_QUERY = f'''
        UPDATE User
        SET {', '.join(setClauses)}
        WHERE user_id = %(user_id)s
        '''
        
        cursor.execute(load_query('serializable'))
        cursor.execute(UPDATE_QUERY, updateParams)

    return await getUserByUserId(user_id=user_id)


@router.delete('/DeleteUser/')
async def deleteUser(
    user_id: int = Query(..., description='ID of the user to delete')
):
    
    deleteParams = {key: value for key, value in locals().items() if key != 'self'}

    with getDBCursor() as cursor:
        
        cursor.execute(load_query('serializable'))
        cursor.execute(load_query('delete_user', query_path='queries/User'), deleteParams)
    
    return {'message': f'User with user_id {user_id} deleted successfully'}