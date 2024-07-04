rem @echo off

set PROJECT=balloon-test-428316
set REGION=us-east4

cd ..

call gcloud config set project %PROJECT%
call gcloud config set run/region %REGION%
call gcloud config set run/platform managed

call gcloud run deploy balloon-test --source . --allow-unauthenticated ^
  --memory 1Gi ^
  --cpu 1 ^
  --max-instances 1

cd deployment