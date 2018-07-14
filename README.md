### Brigade Crypto Pipeline

Making a [Brigade](https://brigade.sh/) pipeline that streams cryptocurrency prices into BigQuery 

NOTE: Instructions for setting up a K8s cluster on GKE with Brigade in 'infrastructure'

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

4. Test the pipeline:
```
brig run donald/crypto -f brigade.js -n brigade
```

5. Set up CronJob:
```
cd cronjob && helm install . -f values.yaml --namespace brigade
```

To confirm that the cronjobs are firing:
```
kubectl get cronjobs -n brigade
kubectl get jobs -n brigade
kubectl get jobs -n brigade | grep "brigade-cron" | awk '{ if ($3 == 0) print $1, $4 }'
kubectl describe job $(kubectl get jobs -n brigade | grep "brigade-cron" | tail -1 | awk '{ print $1 }') --namespace brigade
```

To check status of Brig builds:
```
export BRIG_PROJECT_ID=$(brig project list -n brigade | grep "donald/crypto" | head -1 | awk '{ print $2 }')
export BRIG_BUILD_ID=$(brig build list -n brigade | grep "$BRIG_PROJECT_ID" | tail -1 | awk '{ print $1 }')
brig build list -n brigade | grep "$BRIG_PROJECT_ID" | awk '{ if ($5 != "Succeeded") print $1 }'
brig build logs $BRIG_BUILD_ID -n brigade
kubectl logs j1-$BRIG_BUILD_ID -n brigade
```

===

Other notes:
* Used `jq` commandline tool to convert JSON into newline-delimited JSON for BigQuery import
* Must create `secrets.yaml` file containing 'projectId', 'coinAPIKey', and 'mailgunAPIKey' secrets 
* Helm chart for cron adapted from [https://github.com/technosophos/brigade-cron](https://github.com/technosophos/brigade-cron); added programmatic specification of payload and support for custom namespaces