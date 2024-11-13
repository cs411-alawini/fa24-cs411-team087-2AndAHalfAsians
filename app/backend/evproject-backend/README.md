# How to start

https://www.youtube.com/watch?app=desktop&v=DQwAX5pS4E8

Install google cloud service

Run these commands

```
# Create repository for artifacts (probably skip this one)
gcloud artifacts repositories create evproject-backend --repository-format docker --project fa24-cs411-team087 --location us-central1

# Submit the build
gcloud builds submit --config=cloudbuild.yaml --project fa24-cs411-team087

# Run the thing
gcloud run services replace service.yaml --region us-central1 --project fa24-cs411-team087

# Update policy so anyone can access it
gcloud run services set-iam-policy evproject-backend-service gcr-service-policy.yaml --region us-central1
```