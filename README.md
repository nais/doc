# Welcome to the NAIS documentation repo!
This repository is used to build a [mkdocs](https://www.mkdocs.org/) site hosted on https://doc.nais.io!

All _documentation_ content resides inside the [docs](docs/) folder, with the general structure of the website defined in [mkdocs.yml](mkdocs.yml)'s `nav`-yaml key.

## Local preview-environment set-up
_**NB*_: Due to [limitations in the built-in](https://github.com/mkdocs/mkdocs/issues/2108) `mkdocs serve`'s hot-reload feature, the described set-up relies on dodgy Docker networking.

### Requirements
- `docker`
- `docker-compose`

### How to set-up local preview environment
`docker-compose up --detach --build && open localhost:8080`

## GCP set-up

#### First, ensure you're logged into GCP
`gcloud auth login --update-adc`
#### Then, run `terraform`
```
cd terraform/
&& terraform init -backend-config="bucket=terraform-prod-235011" \
&& terraform apply
```
Et voilá! Presto!

