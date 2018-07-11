### Brigade Crypto Pipeline

Making a [Brigade](https://brigade.sh/) pipeline that streams cryptocurrency prices into BigQuery 

NOTE: Instructions for setting up a K8s cluster with Brigade in 'infrastructure'

1. Create Brigade project with Helm:
```
helm install brigade/brigade-project -f values.yaml,secrets.yaml --namespace brigade
```

2. Build BQ dataset/table for data:
```
bq mk --dataset crypto
bq mk --table crypto.quotes schema.json
```

3. Build Docker image used for pipeline step(s):
```
export PROJECT_ID=$(gcloud config get-value project -q)
docker build -t brigade-crypto:latest .
docker tag brigade-crypto gcr.io/${PROJECT_ID}/brigade-crypto:latest
docker push gcr.io/${PROJECT_ID}/brigade-crypto:latest
```

NOTE: I used a Google Cloud Container Builder image (see [here](https://github.com/GoogleCloudPlatform/cloud-builders/tree/master/gcloud)) as my base image.  This contains gcloud, kubectl, gsutil, and bq utilities.

NOTE: `gcloud docker` is no longer supported.  Need to configure `gcloud` as a Docker credential helper to authenticate requests to Google Container Register.  See [here](https://cloud.google.com/container-registry/docs/support/deprecation-notices#gcloud-docker')

4. Run the pipeline:
```
brig run donald/crypto -f test.js -n brigade
```
