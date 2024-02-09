#! /bin/bash

rm -rf ./out ./docs-base
mkdir -p ./out ./docs-base

# Copy documentation to base folder as we need to use docs as a staging folder
cp -r ./docs/* ./docs-base

for TENANT in $@; 
  do 
    rm -rf ./docs
    cp -r ./docs-base ./docs
    cp -rf ./tenants/$TENANT/* ./docs
    TENANT=$TENANT poetry run mkdocs build --no-strict -d out/$TENANT
  done

