FROM gcr.io/cloud-builders/gcloud:latest

RUN apt-get update \
  && apt-get install -y wget \
  && rm -rf /var/lib/apt/lists/*

RUN wget -O /usr/local/bin/jq https://github.com/stedolan/jq/releases/download/jq-1.5/jq-linux64 \
  && chmod +x /usr/local/bin/jq

ENTRYPOINT ["bash"]