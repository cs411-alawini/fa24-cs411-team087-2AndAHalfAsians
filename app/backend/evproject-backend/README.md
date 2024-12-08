# Backend Overview

## How to access

Go here (if we still have credits) to access the backend docs where you can view API endpoints
https://evproject-backend-service-410247726474.us-central1.run.app

If not, open the `app/backend/evproject-backend/` folder in VSCode with the DevContainers extension, then run:

```
uvicorn src.main:app --host 0.0.0.0 --port 8080 --reload
```

Local URL should be provided to access the backend that way.


## How to deploy

Backend loosely based on tutorial from this video, but the vast majority of it was developed independently
https://www.youtube.com/watch?app=desktop&v=DQwAX5pS4E8

Install google cloud service

Run these commands

Create repository for artifacts (probably skip this one since it is created already)
```
gcloud artifacts repositories create evproject-backend --repository-format docker --project fa24-cs411-team087 --location us-central1
```

Submit the build
```
gcloud builds submit --config=cloudbuild.yaml --project fa24-cs411-team087
```

Run the thing
```
gcloud run services replace service.yaml --region us-central1 --project fa24-cs411-team087
```

Update policy so anyone can access it
```
gcloud run services set-iam-policy evproject-backend-service gcr-service-policy.yaml --region us-central1
```

## Structure Overview

`main.py`: The entry point for the backend, adds routers as needed

`routers/`: The folder containing individual endpoints for each "group" of queries we need to run

`queries/`: The folder containing formatted SQL queries for use with the python mySQL library

`db_connection.py`: Handles the majority of connection management and overall transaction control

`query_loader.py`: Handles loading queries from the `queries` directory

`utils.py`: Misc utility functions
