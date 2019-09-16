# Nexus

We are running Nexus at NAV.

## Docker registry

You can push and pull from our registry at `repo.adeo.no:5443`, and visit it at [repo.adeo.no](https://repo.adeo.no/#browse/browse/components:docker).

You need to log into our Docker registry before pushing or pulling images:

```text
docker login repo.adeo.no:5443
docker push repo.adeo.no:5443/{application}:{releaseVersion}
```

## Maven repo

We use basic auth when uploading [NAIS manifest](https://github.com/nais/doc/tree/8c67c55b42d6da64d90f83effa058ac58e70d79c/documentation/contracts/README.md#nais-manifest) to our Maven repo at [repo.adeo.no](https://repo.adeo.no/).

```text
curl --user username:password --upload-file path/to/nais.yaml https://repo.adeo.no/repository/raw/nais/{appname}/{version}/nais.yaml
```

