#!/bin/bash

docker build -t brig:latest --file Dockerfile.brig .
docker run brig:latest
CONTAINER=$(docker container ls --all | grep "brig:latest" | head -1 | awk '{ print $1 }')
docker cp $CONTAINER:/go/src/github.com/Azure/brigade/bin/brig $1
