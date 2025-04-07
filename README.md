# Welcome to the Nais documentation

See the [Nais handbook](https://handbook.nais.io/technical/doc-guidelines/) for a more detailed explanation of the documentation structure and how to contribute.

## Local development

## 1. Install Poetry

```bash
asdf plugin add poetry
asdf install poetry latest
```

## 2. Install dependencies

```bash
make install
```
## 3. Serve the documentation locally

```bash
make local
```

## 3a. Serve a tenant-specific version of the documentation

```bash
TENANT=nav make local
```
