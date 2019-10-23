---
description: The NAIS manifest `nais.yaml` describes your application
---
# The NAIS manifest

## `metadata.name`
Name of the application.

**Required**: `true`

## `metadata.namespace`
Which namespace the application will be deployed to.

**Default**: default

## `metadata.labels.team`
The name of the [team](../basics/teams.md) that owns this application (lowercase only!).

**Required**: `true`


## `spec.image`
Docker image location plus including docker tag (e.g. docker.pkg.github.com/appname/appname:v1.0.0)

**Required**: `true`

## `spec.port`
The port number which is exposed by the container and should receive HTTP traffic.

**Default**: 8080

## `spec.strategy.type`
Specifies the strategy used to replace old Pods by new ones.

**Default**: RollingUpdate

## `spec.liveness`
The kubelet uses liveness probes to know when to restart a Container. For example, liveness probes could catch a deadlock, where an application is running, but unable to make progress. Restarting a Container in such a state can help to make the application more available despite bugs. Read more about this over at the [Kubernetes documentation](https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/).

### `spec.liveness.path`
HTTP endpoint path that signals 200 OK if the application is running.

**Required**: `true`


### `spec.liveness.port`
Port for the liveness probe.

**Default**: `.spec.port`

### `spec.liveness.initialDelay`
Number of seconds after the container has started before liveness probes are initiated.

**Default**: 20

### `spec.liveness.timeout`
Number of seconds after which the probe times out.

**Default**: 1

### `spec.liveness.periodSeconds`
How often (in seconds) to perform the probe.

**Default**: 10

### `spec.liveness.failureThreshold`
When a Pod starts and the probe fails, Kubernetes will try `failureThreshold` times before giving up. Giving up in case of liveness probe means restarting the Pod. In case of readiness probe the Pod will be marked Unready.

**Default**: 3

## `spec.readiness`
The kubelet uses readiness probes to know when a Container is ready to start accepting traffic. A Pod is considered ready when all of its Containers are ready. One use of this signal is to control which Pods are used as backends for Services. When a Pod is not ready, it is removed from Service load balancers. Read more about this over at the [Kubernetes documentation](https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/).

### `spec.readiness.path`
HTTP endpoint path that signals 200 OK when it is okay to start routing traffic to the application.

**Required**: `true`

### `spec.readiness.port`
Port for the readiness probe.

**Default**: `.spec.port`

### `spec.readiness.initialDelay`
Number of seconds after the container has started before readiness probes are initiated.

**Default**: 20

### `spec.readiness.timeout`
Number of seconds after which the probe times out.

**Default**: 1

## `spec.replicas`
The numbers of pods to run in parallel.

### `spec.replicas.min`
Minimum number of replicas.

**Default**: 2


### `spec.replicas.max`
Maximum number of replicas.

**Default**: 4

## `spec.cpuThresholdPercentage`
Total CPU percentage threshold on deployment, at which point it will increase number of pods if `current < max`. We recommend to read more about [container lifecycle hooks](https://kubernetes.io/docs/concepts/containers/container-lifecycle-hooks/).

## `spec.prometheus`
Prometheus is used to scrape [metrics](](../observability/metrics.md) from the pod.

### `spec.prometheus.enabled`
If true, the pod will be scraped for metrics by Prometheus.

**Default**: `false`

### `spec.prometheus.port`
Path to Prometheus metrics.

**Default**: `.spec.port`

### `spec.prometheus.path`
Path to Prometheus metrics.

**Default**: `/metrics`

## `spec.resources`
When Containers have [resource](http://kubernetes.io/docs/user-guide/compute-resources/) requests specified, the scheduler can make better decisions about which nodes to place Pods on.

### `spec.resources.limits`
If a Container exceeds its limit, it might be terminated. If it is restartable, the kubelet will restart it, as with any other type of runtime failure.

#### `spec.resources.limits.cpu`
App will have its CPU usage throttled if exceeding this limit.

**Default**: 500m

#### `spec.resources.limits.memory`
App will be killed if exceeding this limit.

**Default**: 512Mi

### `spec.resources.requests`
App is guaranteed the requested resources and will be scheduled on nodes with at least this amount of resources available.

#### `spec.resources.requests.cpu`
Guaranteed amount of CPU.

**Default**: 200m

#### `spec.resources.requests.memory`
Guaranteed amount of memory.

**Default**: 256Mi

## `spec.ingresses`
List of ingress URLs that will route HTTP traffic to the application.

## `spec.secrets` (GCP only)
Putting this information in a secret is safer and more flexible than putting it verbatim in a Pod definition or in a container image. See [GCP only features/secrets](../gcp/secrets.md) for more information.

### `spec.secrets[].name`
Name of secret (must exist in namespace).

**Required**: `true`

### `spec.secrets[].type`
How the secrets is exposed to the pod. Valid options is `env` and `files`. Selecting `env` will expose all variables in secret as environment variables and `files` will expose the secrets as files under `spec.secrets[].mountPath`.

**Default**: env

### `spec.secrets[].mountPath`
Path to where secret files will be mounted \(only valid for secret type `files`\).

**Default**: `/var/run/secrets`

## `spec.vault`
Provides secrets management, identity-based access, and encrypting application data for auditing of secrets for applications, systems, and users. Vault documentation can be found in [navikt/vault-iac](https://github.com/navikt/vault-iac/blob/master/doc/endusers.md).

### `spec.vault.enabled`
If set to true, fetch secrets from Vault and inject into the pods.

**Default**: `false`

### `spec.vault.sidecar`
If set to true, will extend tokens time to live.

**Default**: `false`

### `spec.vault.paths[]`
Overriding the `paths` array is optional, and will give you fine-grained control over which vault paths that will be mounted on the file system.

#### `spec.vault.paths[].kvPath`
Path to Vault key/value store that should be mounted into the file system.

**Default**: `/kv/environment/zone/application/namespace`

#### `spec.vault.paths[].mountPath`
File system path that the secrets will be mounted into.

**Default**: `/var/run/secrets/nais.io/vault`

## `spec.configMaps.files`
List of ConfigMap resources that will have their contents mounted into the container as files. Files appear as `/var/run/configmaps/<name>/<key>`.

## `spec.env[]`
Custom environment variables injected into your container.

### `spec.env[].name`
Environment variable name.

**Required**: `true`

### `spec.env[].value`
Environment variable value.

**Required**: `true`

## `spec.preStopHookPath`
A HTTP GET will be issued to this endpoint at least once before the pod is terminated.

**Default**: `/stop`

## `spec.leaderElection`
If true, a HTTP endpoint will be available at `$ELECTOR_PATH` that returns the current leader. Read more about leader election in [addons/leader election](../addons/leader-election.md).

**Default**: `false`

## `spec.webproxy`
Expose web proxy configuration to the application using the `$HTTP_PROXY`, `$HTTPS_PROXY` and `$NO_PROXY` environment variables.

**Default**: `false`

## `spec.logformat`
Format of the logs from the container. Use this if the container doesn't support json logging and the log should be parsed. Supported formats: accesslog, accesslog_with_processing_time, accesslog_with_referer_useragent, capnslog, logrus, gokit, redis, glog, simple, influxdb, log15.

**Default**: `accesslog`

## `spec.logtransform`
The transformation of the logs, if they should be handled differently than plain text or JSON.

**Default**: `dns_loglevel`

## `spec.secureLogs.enabled`
If true, mount a volume for secure logs in the pod.

**Default**: `false`

## `spec.service.port`
Port for the default service.

**Default**: 80

## `spec.skipCaBundle`
If true, no certificate authority bundle will be injected.

**Default**: `false`

## `spec.accessPolicy` (GCP only)
Default will not allow any traffic to or from application. [Access policy](../gcp/access-policy.md) is currently supported in GKE clusters, only.

### `spec.accessPolicy.inbound.rules[]`
List of services to allow traffic from.

#### `spec.accessPolicy.inbound.rules[].application`
Name of the application to allow traffic from.

**Required**: `true`

#### `spec.accessPolicy.inbound.rules[].namespace`
Namespace to application to allow traffic from.

**Default**: `metadata.namespace`

### `spec.accessPolicy.outbound.rules[]`
List of services to allow traffic to.

#### `spec.accessPolicy.outbound.rules\[\].application`
Name of the other service to allow traffic to.

**Required**: `true`

### `spec.accessPolicy.outbound.external[]`
List of services outside cluster to allow traffic to.

#### `spec.accessPolicy.outbound.external[].host`
URL to service outside cluster.

**Required**: `true`
