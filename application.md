# Your first NAIS application

Create a manifest file for any application you want to deploy. Store it as `nais.yaml` in a repository on Github.

A nais.yaml file contains an Application resource. The application resource provides NAIS with the necessary information to run your application. If starting out for the first time, try the minimal nais.yaml example:

```yaml
apiVersion: "nais.io/v1alpha1"
kind: "Application"
metadata:
  name: appname
  namespace: default
  labels:
    team: teamname
spec:
  image: navikt/docker-image:docker-tag
```

The entire specification for the NAIS manifest you can find [here](nais-application/manifest.md).

Build Docker image and push to Docker repository.

