#!/bin/bash

export PROJECT_ID=$(gcloud config get-value project -q)

# Build cluster
terraform init
terraform apply -var project=${PROJECT_ID} -auto-approve
gcloud container clusters get-credentials brigade-cluster
gcloud config set container/cluster brigade-cluster

# NOTE: Need to be running at least Helm v2.8.2 for --wait tag to work
HELM_VERSION=$(helm version --client | sed 's/.*SemVer:"v\([0-9\.]*\)".*/\1/' | sed 's/\.*//g')
if [[ $HELM_VERSION < 282 ]]; then 
	echo "Need to be running at least helm v2.8.2"
	return
fi

# Install Helm
kubectl -n kube-system create sa tiller
kubectl create clusterrolebinding tiller --clusterrole cluster-admin --serviceaccount=kube-system:tiller
helm init --service-account tiller --wait

# Install Brigade
helm repo add brigade https://azure.github.io/brigade
helm install --name brigade-server --namespace brigade --set rbac.enabled=true brigade/brigade
