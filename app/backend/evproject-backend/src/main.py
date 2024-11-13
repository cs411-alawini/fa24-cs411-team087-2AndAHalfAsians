from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from typing import Union
import socket
import uvicorn
# Include the . before the packages since we are looking for relative imports for some reason
from src.db_connection import DatabaseConnectionPool, getDBCursor
from src.customQueries import Queries
from src.smokeTest import router as smoke_test_router

import os

# Uncomment this to debug locally
# if os.getenv("ENV") != "production":
#     import debugpy

#     debugpy.listen(("0.0.0.0", 5678))
#     debugpy.wait_for_client()



def check_port(port):
    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    try:
        sock.bind(('0.0.0.0', port))
        available = True
    except:
        available = False
    sock.close()
    return available

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



app.include_router(smoke_test_router, prefix="/smoke-test")

# Define the API endpoints
@app.get('/')
def health():
    return {
        "message": "OK 🚀"
    }

@app.get("/items/{item_id}")
def read_item(item_id: int, q: Union[str, None] = None):
    return {"item_id": item_id, "q": q}

# localhost:8080/CompatibleStations/?latutude=34.040539&longitude=-118.271387&distance_threshold=40&ev_id=34
# http://localhost:8080/CompatibleStations/?latitude=34.040539&longitude=-118.271387&distance_threshold=40&ev_id=34
@app.get("/CompatibleStations/")
async def get_compatible_stations(
    latitude: float = Query(..., description='Latitude of first point', ge=-90, le=90),
    longitude: float = Query(..., description='Longitude of first point', ge=-180, le=180),
    distance_threshold: float = Query(..., description='Range to search for vehicles'),
    ev_id: int = Query(..., description='ev_id of the vehicle'),
):
    
    with getDBCursor() as cursor:
        params = {
            'latitude': latitude,
            'longitude': longitude,
            'distance_threshold': distance_threshold,
            'ev_id': ev_id
        }
        
        cursor.execute(Queries.Q1, params)
    
        results = []
        
        for row in cursor:
            results.append(row)
    
    return results


# Run me with:
# uvicorn src.main:app --host 0.0.0.0 --port 8080 --reload
if __name__ == "__main__":
    DatabaseConnectionPool._initPool()
    port = 8080
    if check_port(port):
        uvicorn.run("src.main:app", host="0.0.0.0", port=port, reload=os.getenv("ENV") != "production")
    else:
        print(f"Port {port} is already in use. Please free the port and try again.")
    
    print('Application started!')