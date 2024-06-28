# Welcome to the NAIS documentation

See the [NAIS handbook](https://handbook.nais.io/technical/write-the-doc/) for a more detailed explanation of the documentation structure and how to contribute.

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
make local tenant=nav
```
