export PROJECT_ID=$(gcloud config get-value project -q)
helm delete brigade-server
terraform destroy -var project=${PROJECT_ID} -force
