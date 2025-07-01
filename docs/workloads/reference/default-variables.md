---
tags: [workloads, reference]
---

# Default workload variables

These environment variables will be injected into your workload container

| variable            | example                  | source                                           |
|:--------------------|:-------------------------|:-------------------------------------------------|
| `PORT`              | `8080`                   | defaults to 8080, otherwise `.spec.port`         |
| `BIND_ADDRESS`      | `0.0.0.0:8080`           | 0.0.0.0:<PORT> (see above)                       |
| `NAIS_APP_NAME`     | `myapp`                  | metadata.name from app.yaml                      |
| `NAIS_NAMESPACE`    | `default`                | metadata.namespace from app.yaml                 |
| `NAIS_APP_IMAGE`    | `navikt/myapp:69`        | spec.image from app.yaml                         |
| `NAIS_CLUSTER_NAME` | `prod`                   | which environment you are running in             |
| `NAIS_CLIENT_ID`    | `prod-fss:default:myapp` | concatenation of cluster, namespace and app name |
| `NAIS_POD_NAME`     | `myapp-74dbb9ff9f-7zvsh` | the pod's name                                   |
