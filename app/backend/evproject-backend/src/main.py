from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from . import smokeTest
from typing import Union

import os
if os.getenv("ENV") != "production":
    import debugpy

    debugpy.listen(("0.0.0.0", 8080))
    # debugpy.wait_for_client()

app = FastAPI()

origins = [
    "*"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)



app.include_router(smokeTest.router, prefix="/smoke-test")

# Define the API endpoints
@app.get('/')
def health():
    return {
        "message": "OK 🚀"
    }

@app.get("/items/{item_id}")
def read_item(item_id: int, q: Union[str, None] = None):
    return {"item_id": item_id, "q": q}

@app.get("/ElectricVehicle/{ev_id}")
def read_item(ev_id: int, q: Union[str, None] = None):
    return {"ev_id": ev_id, "q": q}

print('Running')