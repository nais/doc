# Welcome to the NAIS documentation repo

This repository is used to build a [mkdocs](https://www.mkdocs.org/) site hosted on <https://doc.nais.io>!

All _documentation_ content resides inside the [docs](docs/) folder, with the general structure of the website defined in [mkdocs.yml](mkdocs.yml)'s `nav`-yaml key.

## Local preview-environment set-up

### install Poetry


```bash
asdf plugin add poetry
asdf install poetry latest
```
### run docs
```bash
make install
make local
```
