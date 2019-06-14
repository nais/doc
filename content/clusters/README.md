## Clusters

We currently provide these Kubernetes clusters:

- dev-fss (previously preprod-fss)
- prod-fss
- dev-sbs (previously preprod-sbs)
- prod-sbs


| cluster name | on-prem | access policies enabled |
| ------------ | ------- | ----------------------- |
| dev-fss (previously preprod-fss) | yes | no |
| prod-fss | yes | no |
| dev-sbs (previously preprod-sbs) | yes | no |
| prod-sbs | yes | no |
| dev-gcp | no | yes |
| prod-gcp | no | yes |


The name of each cluster is on the format `<environment class>-<zone>`

### Ingress

Applications running in this cluster can be reached internally (if configured) through ingress on this format  `<app name>.<cluster name>.nais.io`
