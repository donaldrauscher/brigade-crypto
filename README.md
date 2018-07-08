### Brigade Crypto Pipeline

Making a [Brigade](https://brigade.sh/) pipeline that streams cryptocurrency prices into BigQuery 

NOTE: Instructions for setting up a K8s cluster with Brigade [here](https://github.com/donaldrauscher/brigade-build)

Create Brigade project with Helm:
```
helm install brigade/brigade-project -f values.yaml,secrets.yaml --namespace brigade
```

Run the pipeline:
```
brig run donald/crypto -f test.js -n brigade
```
