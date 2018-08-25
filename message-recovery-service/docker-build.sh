#!/bin/bash

set -e

REGISTRY_URL="gcr.io/$(gcloud config get-value project -q)"
VERSION_FILE="build/version.json"

version=$(git log -1 --format='format:%H' HEAD -- $PWD | head -c 8)
imageName="message-recovery-service:$version"

echo "Version: $version"

echo "Building Source"
yarn build

echo "{\"version\": \"$version\"}" > $VERSION_FILE

echo "Building Image"
sudo docker build -t $REGISTRY_URL/$imageName .
sudo docker push $REGISTRY_URL/$imageName

echo "Pushed $imageName to $REGISTRY_URL"
