#! /bin/bash
set -e

rm -rf ./out
mkdir -p ./out

for TENANT in $@;
  do
    TENANT="${TENANT}" NOT_TENANT="not-${TENANT}" poetry run mkdocs build --strict -d "out/${TENANT}"
  done
