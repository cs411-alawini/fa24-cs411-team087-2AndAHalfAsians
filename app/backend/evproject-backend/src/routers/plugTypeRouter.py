from fastapi import APIRouter, Query
from pydantic import BaseModel
from src.db_connection import getDBCursor
from src.query_loader import load_query
from src.utils import genericReadQuery

router = APIRouter(
    prefix='/PlugType',
    tags=['PlugType']
)

class ResponseBody(BaseModel):
    message: str

TABLE = 'PlugType'

@router.get(f'/Get{TABLE}')
async def getPlugType(
    type_id: int = Query(..., description='The type_id to get')
):
    params = {key: value for key, value in locals().items() if key != 'self'}
    with getDBCursor() as cursor:
        cursor.execute(load_query('read_committed'))
        cursor.execute(genericReadQuery(table=TABLE, key='type_id'), params)
        results = cursor.fetchall()
    return results

