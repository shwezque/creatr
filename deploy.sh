#!/bin/bash
set -e

# Configuration
PROJECT_ID="${GCP_PROJECT_ID:-$(gcloud config get-value project)}"
REGION="${GCP_REGION:-asia-southeast1}"
API_SERVICE_NAME="creatr-api"
WEB_SERVICE_NAME="creatr-web"

echo "🚀 Deploying Creatr to Google Cloud Run"
echo "Project: $PROJECT_ID"
echo "Region: $REGION"
echo ""

# Build and deploy API
echo "📦 Building and deploying API..."
gcloud builds submit \
  --tag gcr.io/$PROJECT_ID/$API_SERVICE_NAME \
  --project $PROJECT_ID \
  .

gcloud run deploy $API_SERVICE_NAME \
  --image gcr.io/$PROJECT_ID/$API_SERVICE_NAME \
  --platform managed \
  --region $REGION \
  --allow-unauthenticated \
  --set-env-vars "DATABASE_URL=file:./dev.db,NODE_ENV=production" \
  --memory 512Mi \
  --project $PROJECT_ID

# Get API URL
API_URL=$(gcloud run services describe $API_SERVICE_NAME --region $REGION --format 'value(status.url)' --project $PROJECT_ID)
echo "✅ API deployed at: $API_URL"
echo ""

# Build and deploy Web
echo "📦 Building and deploying Web..."
gcloud builds submit \
  --tag gcr.io/$PROJECT_ID/$WEB_SERVICE_NAME \
  --project $PROJECT_ID \
  -f apps/web/Dockerfile \
  .

gcloud run deploy $WEB_SERVICE_NAME \
  --image gcr.io/$PROJECT_ID/$WEB_SERVICE_NAME \
  --platform managed \
  --region $REGION \
  --allow-unauthenticated \
  --set-env-vars "VITE_API_URL=$API_URL" \
  --memory 256Mi \
  --project $PROJECT_ID

# Get Web URL
WEB_URL=$(gcloud run services describe $WEB_SERVICE_NAME --region $REGION --format 'value(status.url)' --project $PROJECT_ID)
echo "✅ Web deployed at: $WEB_URL"
echo ""

echo "🎉 Deployment complete!"
echo "✅ API: $API_URL"
echo "✅ Web: $WEB_URL"
