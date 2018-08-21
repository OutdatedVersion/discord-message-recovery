#!/bin/bash

set -e

version=$(git log -1 --format='format:%H' HEAD -- $PWD | head -c 8)
imageName="kratos/message-recovery-service:$version"
registryURL="docker-registry.outdatedversion.com"

echo "Version: $version"

echo "Building Source"
yarn build

echo "Building Image"
sudo docker build -t $imageName .
sudo docker tag $imageName $registryURL/$imageName
sudo docker push $registryURL/$imageName
