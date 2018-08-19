#!/bin/bash

BLUE="\e[34m"
GREEN="\e[32m"
BOLD="\e[1m"
RESET="\e[0m"

projects=$(find */package.json -maxdepth 1)

for project in $projects; do
    # 'package.json': 12 chars

    directory=$(awk 'END{ name=FILENAME; l=length(name); print substr(name, 0, l - 12)}' $project)

    cd $directory

    echo -e "$BLUE$BOLD $directory$RESET"

    rm -rf build
    ../node_modules/.bin/babel src -d build

    cd ../
done

projectCount=$(expr ${#projects[@]} + 1)
echo -e "\n$GREEN$BOLD built $projectCount common module(s)"