from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter(
    prefix="/testRouter",
    tags=["Test"]
)

class ResponseBody(BaseModel):
    message: str

@router.get("/hello-world2", response_model=ResponseBody)
def hello_world() -> ResponseBody:
    """
    Simple endpoint to return a 'Hello, world!' message.

    Returns:
        ResponseBody: A JSON object containing the message.
    """
    return {"message": "Hello, world! 2"}


@router.get("/hello-world", response_model=ResponseBody)
def hello_world() -> ResponseBody:
    """
    Simple endpoint to return a 'Hello, world!' message.

    Returns:
        ResponseBody: A JSON object containing the message.
    """
    return {"message": "Hello, world!"}
