from fastapi import FastAPI, Query, HTTPException, status, Request
from fastapi.middleware.cors import CORSMiddleware
from typing import Union
import uvicorn
from src.db_connection import DatabaseConnectionPool, getDBCursor
from mysql.connector import errorcode, Error

from src.query_loader import load_query
import importlib

import os


# Uncomment this to debug locally
# if os.getenv("ENV") != "production":
#     import debugpy

#     debugpy.listen(("0.0.0.0", 5678))
#     debugpy.wait_for_client()

# TODO: Should we pass in a cursor as an argument to nested calls? 
#   If we call a(a(a(a(params)))) are we making 4 separate cursors which each have their own
#   connection? If so we could easily run out so it may be better to pass in the existing cursor
#   if possible. If we do this, we would have to be more careful about transaction and failure management

# TODO: All these queries will probably explode, should add better error handling
# TODO: Refactor this into separate routes? It was pretty rough getting the imports to work though with GCP

tagsData = [
    {
        'name': 'OwnsEV',
        'description': 'All endpoints directly modifying the OwnsEV table'
    },
    {
        'name': 'PlugInstance',
        'description': 'Endpoints that relate to who owns an EV'
    },
    {
        'name': 'EVStation',
        'description': 'Endpoints for interacting with the EVStation table'
    },
    {
        'name': 'CustomQueries',
        'description': 'All custom queries developed for stage 3. Non-CRUD queries.'
    },
    {
        'name': 'User',
        'description': 'All user-related queries'
    }
]

app = FastAPI(
    title='EV Charging Station API',
    description='IDK',
    version='0.0.0.0.0.0.0.0.0.1.2',
    openapi_tags=tagsData
)

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


# Dynamically load routers
def include_all_routers(app: FastAPI, routers_dir: str = "src/routers"):
    """
    Dynamically discover and include routers from the routers directory.
    """
    for file in os.listdir(routers_dir):
        if file.endswith(".py") and file != "__init__.py":
            module_name = f"{routers_dir.replace('/', '.')}.{file[:-3]}"
            module = importlib.import_module(module_name)
            if hasattr(module, "router"):
                app.include_router(module.router)
                print(f"Included router: {module_name}")

include_all_routers(app)

# Define the API endpoints
@app.get('/')
def health(request: Request):
    return {
        "message": f"Application is running! Visit {str(request.url)}docs for endpoint access."
    }


# Run me with:
# uvicorn src.main:app --host 0.0.0.0 --port 8080 --reload
# Go to localhost:8080/docs to get an interactive way to mess with the endpoints
if __name__ == "__main__":
    DatabaseConnectionPool._initPool()
    port = 8080
    uvicorn.run("src.main:app", host="0.0.0.0", port=port, reload=os.getenv("ENV") != "production")
    
    print('Application started!')