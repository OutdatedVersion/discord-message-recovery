#!/bin/bash

version=$(git log -1 --format='format:%H' HEAD -- $PWD | head -c 8)

echo "Version: $version"

echo "Grabbing common modules"

cp -r ../common .

echo "Building Image"
sudo docker build -t outdatedversion/kratos-message-recovery-service:$version .

echo "Removing common modules"
rm -rf common