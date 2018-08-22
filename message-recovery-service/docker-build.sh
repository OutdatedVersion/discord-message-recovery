#!/bin/bash

set -e

VERSION_FILE="build/version.json"

version=$(git log -1 --format='format:%H' HEAD -- $PWD | head -c 8)
imageName="kratos/message-recovery-service:$version"
registryURL="docker-registry.outdatedversion.com"

echo "Version: $version"

echo "Building Source"
yarn build

echo "{\"version\": \"$version\"}" > $VERSION_FILE

echo "Building Image"
sudo docker build -t $imageName .
sudo docker tag $imageName $registryURL/$imageName
sudo docker push $registryURL/$imageName
