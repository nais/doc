Nexus
=====

We are running Nexus at NAV.


## Docker registry

You can push and pull from our registry at `docker.adeo.no:5000`, and visit it at [repo.adeo.no](https://repo.adeo.no/#browse/browse/components:docker).

You need to log into our Docker registry before pushing or pulling images:

```text
docker login repo.adeo.no:5000
docker push docker.adeo.no:5000/{application}:{releaseVersion}
```


## Maven repo

We use basic auth when Uploading [NAIS manifest](/contracts/manifest.md) to our Maven repo at [repo.adeo.no](https://repo.adeo.no/).

```
curl --user username:password --upload-file path/to/nais.yaml https://repo.adeo.no/repository/raw/nais/{appname}/{version}/nais.yaml
```
