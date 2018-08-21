#!/bin/bash

version=$(git log -1 --format='format:%H' HEAD -- $PWD | head -c 8)
imageName="kratos/message-recovery-service:$version"
registryURL="docker-registry.outdatedversion.com"

echo "Version: $version"

echo "Grabbing common modules"

cp -r ../common .

echo "Building Image"
sudo docker build -t $imageName .
sudo docker tag $imageName $registryURL/$imageName
sudo docker push $registryURL/$imageName

echo "Removing common modules"
rm -rf common