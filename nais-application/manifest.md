---
description: The NAIS manifest `nais.yaml` describes your application
---
# The NAIS manifest

## `metadata.name`
Required: `true`  
Description: Name of the application

## `metadata.namespace`
Default: default  
Description: Which namespace the application will be deployed to

## `metadata.labels.team`
Required: `true`  
Description: The name of the team that owns this application (lowercase only!)  
Documentation: [teams](../basics/teams.md)


## `spec.image`
Required: `true`  
Description: Docker image location plus including docker tag (e.g. docker.pkg.github.com/appname/appname:v1.0.0)

## `spec.port`
Default: 8080  
Description: The HTTP port exposed by the container

## `spec.strategy.type`
Default: RollingUpdate  
Description: Specifies the strategy used to replace old Pods by new ones

## `spec.liveness`
Description: The kubelet uses liveness probes to know when to restart a Container. For example, liveness probes could catch a deadlock, where an application is running, but unable to make progress. Restarting a Container in such a state can help to make the application more available despite bugs.  
Documentation: https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/

### `spec.liveness.path`
Required: `true`  
Description: Path for the liveness probe

### `spec.liveness.port`
Default: `.spec.port`  
Description: Port for the liveness probe

### `spec.liveness.initialDelay`
Default: 20  
Description: Number of seconds after the container has started before liveness probes are initiated

### `spec.liveness.timeout`
Default: 1  
Description: Number of seconds after which the probe times out

### `spec.liveness.periodSeconds`
Default: 10  
Description: How often (in seconds) to perform the probe

### `spec.liveness.failureThreshold`
Default: 3  
Description: When a Pod starts and the probe fails, Kubernetes will try `failureThreshold` times before giving up. Giving up in case of liveness probe means restarting the Pod. In case of readiness probe the Pod will be marked Unready

## `spec.readiness`
Description: The kubelet uses readiness probes to know when a Container is ready to start accepting traffic. A Pod is considered ready when all of its Containers are ready. One use of this signal is to control which Pods are used as backends for Services. When a Pod is not ready, it is removed from Service load balancers.  
Documentation: https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/

### `spec.readiness.path`
Required: `true`  
Description: Path for the readiness probe

### `spec.readiness.port`
Default: `.spec.port`  
Description: Port for the readiness probe

### `spec.readiness.initialDelay`
Default: 20  
Description: Number of seconds after the container has started before readiness probes are initiated

### `spec.readiness.timeout`
Default: 1  
Description: Number of seconds after which the probe times out

## `spec.replicas`
Description: The numbers of pods to run in parallel

### `spec.replicas.min`
Default: 2  
Description: Minimum number of replicas

### `spec.replicas.max`
Default: 4  
Description: Maximum number of replicas

## `spec.cpuThresholdPercentage`
Description: Total CPU percentage threshold on deployment, at which point it will increase number of pods if `current < max`.  
Documentation: https://kubernetes.io/docs/concepts/containers/container-lifecycle-hooks/

## `spec.prometheus`
Description: Prometheus is used to scrape metrics from the pod.  
Documentation: See [Observability/metrics](../observability/metrics)

### `spec.prometheus.enabled`
Default: `false`  
Description: If true, the pod will be scraped for metrics by Prometheus

### `spec.prometheus.port`
Default: `.spec.port`  
Description: Path to Prometheus metrics

### `spec.prometheus.path`
Default: `/metrics`  
Description: Path to Prometheus metrics

## `spec.resources`
Description: When Containers have resource requests specified, the scheduler can make better decisions about which nodes to place Pods on.  
Documentation: http://kubernetes.io/docs/user-guide/compute-resources/

### `spec.resources.limits`
Describe: If a Container exceeds its limit, it might be terminated. If it is restartable, the kubelet will restart it, as with any other type of runtime failure.

#### `spec.resources.limits.cpu`
Default: 500m  
Description: App will have its CPU usage throttled if exceeding this limit

#### `spec.resources.limits.memory`
Default: 512Mi  
Description: App will be killed if exceeding this limit

### `spec.resources.requests`
Description: App is guaranteed the requested resources and will be scheduled on nodes with at least this amount of resources available.

#### `spec.resources.requests.cpu`
Default: 200m  
Description: Guaranteed amount of CPU

#### `spec.resources.requests.memory`
Default: 256Mi  
Description: Guaranteed amount of memory

## `spec.ingresses`
Description: List of ingress URLs that will route HTTP traffic to the application

## `spec.secrets` (GCP only)
Description: Putting this information in a secret is safer and more flexible than putting it verbatim in a Pod definition or in a container image.
Documentation: See [GCP only features/secrets](../gcp-only/secrets.md)

### `spec.secrets[].name`
Required: `true`  
Description: Name of secret (must exist in namespace)

### `spec.secrets[].type`
Default: env  
Description: How the secrets is exposed to the pod. Valid options is `env` and `files`. Selecting `env` will expose all variables in secret as environment variables and `files` will expose the secrets as files under `spec.secrets[].mountPath`

### `spec.secrets[].mountPath`
Default: `/var/run/secrets`  
Description: Path to where secret files will be mounted \(only valid for secret type `files`\)

## `spec.vault`
Description: Provides secrets management, identity-based access, and encrypting application data for auditing of secrets for applications, systems, and users  
Documentation: https://github.com/navikt/vault-iac/blob/master/doc/endusers.md

### `spec.vault.enabled`
Default: `false`  
Description: If set to true, fetch secrets from Vault and inject into the pods

### `spec.vault.sidecar`
Default: `false`  
Description: If set to true, will extend tokens time to live

### `spec.vault.paths[]`
Description: Overriding the `paths` array is optional, and will give you fine-grained control over which vault paths that will be mounted on the file system.

#### `spec.vault.paths[].kvPath`
Default: `/kv/environment/zone/application/namespace`  
Description: Path to Vault key/value store that should be mounted into the file system

#### `spec.vault.paths[].mountPath`
Default: `/var/run/secrets/nais.io/vault`  
Description: File system path that the secrets will be mounted into

## `spec.configMaps.files`
Description: List of ConfigMap resources that will have their contents mounted into the container as files. Files appear as `/var/run/configmaps/<name>/<key>`.

## `spec.env[]`
Description: Custom environment variables injected into your container

### `spec.env[].name`
Required: `true`  
Description: Environment variable name

### `spec.env[].value`
Required: `true`  
Description: Environment variable value

## `spec.preStopHookPath`
Default: `/stop`  
Description: A HTTP GET will be issued to this endpoint at least once before the pod is terminated

## `spec.leaderElection`
Default: `false`  
Description: If true, a HTTP endpoint will be available at `$ELECTOR_PATH` that returns the current leader

## `spec.webproxy`
Default: `false`  
Desctiption: Expose web proxy configuration to the application using the `$HTTP_PROXY`, `$HTTPS_PROXY` and `$NO_PROXY` environment variables

## `spec.logformat`
Default: `accesslog`  
Description: Format of the logs from the container, if not in plain text or JSON

## `spec.logtransform`
Default: `dns_loglevel`  
Description: The transformation of the logs, if they should be handled differently than plain text or JSON

## `spec.secureLogs.enabled`
Default: `false`  
Description: If true, mount a volume for secure logs in the pod

## `spec.service.port`
Default: 80  
Description: Port for the default service

## `spec.skipCaBundle`
Default: `false`  
Description: If true, no certificate authority bundle will be injected


## `spec.accessPolicy` (GCP only)
Description: Default will not allow any traffic to or from application. Access policy is currently supported in GKE clusters, only.  
Documentation: [GCP only features/access-policy](../gcp-only/access-policy.md)

### `spec.accessPolicy.inbound.rules[]`
Description: List of services to allow traffic from

#### `spec.accessPolicy.inbound.rules[].application`
Required: `true`  
Description: Name of the application to allow traffic from

#### `spec.accessPolicy.inbound.rules[].namespace`
Default: `metadata.namespace`  
Description: Namespace to application to allow traffic from

### `spec.accessPolicy.outbound.rules[]`
Description: List of services to allow traffic to

#### `spec.accessPolicy.outbound.rules\[\].application`
Required: `true`  
Description: Name of the other service to allow traffic to

### `spec.accessPolicy.outbound.external[]`
Description: List of services outside cluster to allow traffic to

#### `spec.accessPolicy.outbound.external[].host`
Required: `true`  
Description: URL to service outside cluster
