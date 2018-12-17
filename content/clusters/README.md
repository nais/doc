## Clusters

We currently provide these Kubernetes clusters:

- dev-gke
- prod-gke
- dev-fss (previously preprod-fss)
- prod-fss
- dev-sbs (previously preprod-sbs)
- prod-sbs

The name of each cluster is on the format `<environment class>.<zone>`

### Ingress

Applications running in this cluster can be reached internally (if configured) through ingress on this format  `<app name>.<cluster name>.nais.io`
