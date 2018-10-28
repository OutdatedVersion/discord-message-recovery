#!/bin/bash

set -e

REGISTRY_URL="gcr.io/$(gcloud config get-value project -q)"
VERSION_FILE="build/version.json"

version=$(git log -1 --format='format:%H' HEAD -- $PWD | head -c 8)
imageName="message-recovery-service:$version"

echo "Version: $version"

echo "Building Source"
yarn -s run build --project tsconfig.prod.json

echo "{\"version\": \"$version\"}" > $VERSION_FILE

echo "Building Image"
docker build -t $REGISTRY_URL/$imageName .
docker push $REGISTRY_URL/$imageName

echo "Pushed $imageName to $REGISTRY_URL"