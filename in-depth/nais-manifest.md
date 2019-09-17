# The NAIS manifest

The NAIS manifest `nais.yaml` describes your application. You can see a minimal example manifest at the bottom.

Here you can find all the supported fields for the manifest.

| Parameter | Description | Default | Required |
| :--- | :--- | :--- | :---: |
| metadata.name | Name of the application |  | x |
| metadata.namespace | Which namespace the application will be deployed to |  | x |
| metadata.labels.team | [mailnick/tag](basics/teams) |  | x |
| spec.image | Docker image location, including version |  | x |
| spec.port | The HTTP port exposed by the container | 8080 |  |
| spec.strategy.type | Specifies the strategy used to replace old Pods by new ones | RollingUpdate |  |
| spec.liveness.path | Path of the [liveness probe](https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-probes/) |  | x |
| spec.liveness.port | Port for liveness probe | `.spec.port` |  |
| spec.liveness.initialDelay | Number of seconds after the container has started before liveness probes are initiated | 20 |  |
| spec.liveness.timeout | Number of seconds after which the probe times out | 1 |  |
| spec.liveness.periodSeconds | How often \(in seconds\) to perform the probe | 10 |  |
| spec.liveness.failureThreshold | When a Pod starts and the probe fails, Kubernetes will try `failureThreshold` times before giving up. Giving up in case of liveness probe means restarting the Pod. In case of readiness probe the Pod will be marked Unready | 3 |  |
| spec.readiness.path | Path of the [readiness probe](https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-probes/) |  | x |
| spec.readiness.port | Port for readiness probe | `.spec.port` |  |
| spec.readiness.initialDelay | Number of seconds after the container has started before readiness probes are initiated | 20 |  |
| spec.readiness.timeout | Number of seconds after which the probe times out | 1 |  |
| spec.replicas.min | Minimum number of replicas | 2 |  |
| spec.replicas.max | Maximum number of replicas | 4 |  |
| spec.cpuThresholdPercentage | Total CPU percentage threshold on deployment, at which point it will increase number of pods if `current < max`. See [container lifecycle hooks documentation](https://kubernetes.io/docs/concepts/containers/container-lifecycle-hooks/) |  |  |
| spec.prometheus.enabled | If true, the pod will be scraped for metrics by Prometheus | false |  |
| spec.prometheus.port | Path to Prometheus metrics | `.spec.port` |  |
| spec.prometheus.path | Path to Prometheus metrics | /metrics |  |
| spec.resources | See [compute resources guide](http://kubernetes.io/docs/user-guide/compute-resources/) |  |  |
| spec.resources.limits.cpu | App will have its CPU usage throttled if exceeding this limit | 500m |  |
| spec.resources.limits.memory | App will be killed if exceeding this limit | 512Mi |  |
| spec.resources.requests | App is guaranteed the requested resources and will be scheduled on nodes with at least this amount of resources available |  |  |
| spec.resources.requests.cpu | Guaranteed amount of CPU | 200m |  |
| spec.resources.requests.memory | Guaranteed amount of memory | 256Mi |  |
| spec.ingresses | List of ingress URLs that will route HTTP traffic to the application |  |  |
| spec.secrets\[\].name | \(GCP only, not available on-prem\) Name of secret \(must exist in namespace\) |  | x |
| spec.secrets\[\].type | \(GCP only, not available on-prem\) How the secrets is exposed to the pod. Valid options is `env` and `files`. Selecting `env` will expose all variables in secret as environment variables and `files` will expose the secrets as files under `spec.secrets[].mountPath` | `env` |  |
| spec.secrets\[\].mountPath | \(GCP only, not available on-prem\) Path to where secret files will be mounted \(only valid for secret type `files`\) | /var/run/secrets |  |
| spec.vault.enabled | If set to true, fetch secrets from [Vault](https://github.com/nais/doc/tree/master/content/secrets) and inject into the pods | false |  |
| spec.vault.sidecar | If set to true, will extend tokens time to live | false |  |
| spec.vault.paths | Overriding the `paths` array is optional, and will give you fine-grained control over which vault paths that will be mounted on the file system. |  |  |
| spec.vault.paths.\[\].kvPath | Path to Vault key/value store that should be mounted into the file system | /kv/environment/zone/application/namespace |  |
| spec.vault.paths.\[\].mountPath | File system path that the secrets will be mounted into | /var/run/secrets/nais.io/vault |  |
| spec.configMaps.files | List of ConfigMap resources that will have their contents mounted into the container as files. Files appear as `/var/run/configmaps/<name>/<key>`. |  |  |
| spec.env\[\].name | Environment variable name |  | x |
| spec.env\[\].value | Environment variable value |  | x |
| spec.preStopHookPath | A HTTP GET will be issued to this endpoint at least once before the pod is terminated | /stop |  |
| spec.leaderElection | If true, a HTTP endpoint will be available at `$ELECTOR_PATH` that returns the current leader | false |  |
| spec.webproxy | Expose web proxy configuration to the application using the `$HTTP_PROXY`, `$HTTPS_PROXY` and `$NO_PROXY` environment variables | false |  |
| spec.logformat | Format of the logs from the container, if not in plain text or JSON | accesslog |  |
| spec.logtransform | The transformation of the logs, if they should be handled differently than plain text or JSON | dns\_loglevel |  |
| spec.secureLogs.enabled | If true, mount a volume for secure logs in the pod | false |  |
| spec.service.port | Port for the default service | 80 |  |
| spec.skipCaBundle | If true, no certificate authority bundle will be injected | false |  |
| spec.accessPolicy | Default will not allow any traffic to or from application. Access policy is currently supported in GKE clusters, only. Read more in our [documentation](https://github.com/nais/doc/tree/master/content/drafts/access-policies.md) |  |  |
| spec.accessPolicy.inbound.rules | List of services to allow traffic from |  |  |
| spec.accessPolicy.inbound.rules\[\].application | Name of the application to allow traffic from |  | x |
| spec.accessPolicy.inbound.rules | Namespace to application to allow traffic from | metadata.namespace |  |
| spec.accessPolicy.outbound.rules | List of services to allow traffic to |  |  |
| spec.accessPolicy.outbound.rules\[\].application | Name of the other service to allow traffic to |  | x |
| spec.accessPolicy.outbound.external | List of services outside cluster to allow traffic to |  |  |
| spec.accessPolicy.outbound.external\[\].host | URL to service outside cluster |  | x |

## Default environment variables

These environment variables will be injected into your application container

| variable | example | source |
| :--- | :--- | :--- |
| NAIS\_APP\_NAME | myapp | metadata.name from nais.yaml |
| NAIS\_NAMESPACE | default | metadata.namespace from nais.yaml |
| NAIS\_APP\_IMAGE | navikt/myapp:69 | spec.image from nais.yaml |
| NAIS\_CLUSTER\_NAME | prod-fss | naiserator runtime context |

## Minimal nais.yaml example

```yaml
apiVersion: "nais.io/v1alpha1"
kind: "Application"
metadata:
  name: nais-testapp
  namespace: default
  labels:
    team: aura
spec:
  image: navikt/nais-testapp:1
```
