---
description: The NAIS manifest nais.yaml describes your application
---
# The NAIS manifest

## `metadata.name`
Name of the application.

**Required**: `true`

## `metadata.namespace`
Which namespace the application will be deployed to.

**Default**: default

{% hint style="info" title="Note" %}
It is recommended to use [team namespaces](../clusters/team-namespaces.md) instead of using the default namespace.
{% endhint %}

## `metadata.labels.team`
The name of the [team](../basics/teams.md) that owns this application (lowercase only!).

**Required**: `true`

**Allowed values**: `([a-z0-9\-])+` team name starting with a letter and only lowercase letters, numbers and dashes is allowed

## `spec.image`
Docker image location plus including docker tag (e.g. `docker.pkg.github.com/appname/appname:v1.0.0`)

**Required**: `true`

## `spec.port`
The port number which is exposed by the container and should receive HTTP traffic.

**Default**: 8080

## `spec.strategy.type`
Specifies the strategy used to replace old Pods by new ones.

**Default**: RollingUpdate

## `spec.liveness`
Many applications running for long periods of time eventually transition to broken states, and cannot recover except by being restarted. Kubernetes provides liveness probes to detect and remedy such situations.
Read more about this over at the [Kubernetes probes documentation](https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/).

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
When a Pod starts and the probe fails, Kubernetes will try `failureThreshold` times before giving up. Giving up in case of liveness probe means restarting the Pod.

**Default**: 3

## `spec.readiness`
Sometimes, applications are temporarily unable to serve traffic. For example, an application might need to load large data or configuration files during startup, or depend on external services after startup. In such cases, you don't want to kill the application, but you don’t want to send it requests either. Kubernetes provides readiness probes to detect and mitigate these situations. A pod with containers reporting that they are not ready does not receive traffic through Kubernetes Services.
Read more about this over at the [Kubernetes readiness documentation](https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/).

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

## `spec.startup`
Startup probes will be available with Kubernetes 1.17. Do not use this feature yet as it will not work.

Sometimes, you have to deal with legacy applications that might require an additional startup time on their first initialization. In such cases, it can be tricky to set up liveness probe parameters without compromising the fast response to deadlocks that motivated such a probe. The trick is to set up a startup probe with the same command, HTTP or TCP check, with a failureThreshold * periodSeconds long enough to cover the worse case startup time.
Read more about this over at the [Kubernetes startup probe documentation](https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/#define-startup-probes).

### `spec.startup.path`
HTTP endpoint path that signals 200 OK if the application has started successfully.

**Required**: `true`

### `spec.startup.port`
Port for the startup probe.

**Default**: `.spec.port`

### `spec.startup.initialDelay`
Number of seconds after the container has started before startup probes are initiated.

**Default**: 20

### `spec.startup.timeout`
Number of seconds after which the probe times out.

**Default**: 1

### `spec.startup.periodSeconds`
How often (in seconds) to perform the probe.

**Default**: 10

### `spec.startup.failureThreshold`
When a Pod starts and the probe fails, Kubernetes will try `failureThreshold` times before giving up. Giving up in case of a startup probe means restarting the Pod.

## `spec.replicas`
The numbers of pods to run in parallel.

### `spec.replicas.min`
Minimum number of replicas.

**Default**: 2

### `spec.replicas.max`
Maximum number of replicas.

**Default**: 4

## `spec.replicas.cpuThresholdPercentage`
The total CPU percentage threshold for the [Horizontal Pod Autoscaler (HPA)](https://kubernetes.io/docs/tasks/run-application/horizontal-pod-autoscale/). In short, if the current number of replicas for a deployment is below the maximum number of replicas set in `spec.replicas.max`, the HPA will automatically increase the number of replicas whenever the average CPU utilization across all replicas reach this threshold percentage of the [requested](#spec-resources-requests) CPU resources.

We recommend to read more about [container lifecycle hooks](https://kubernetes.io/docs/concepts/containers/container-lifecycle-hooks/).

**Default**: `50`

## `spec.prometheus`
Prometheus is used to scrape [metrics](../observability/metrics.md) from the pod.

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

**Allowed values**: `^\d+m?$`

**Example**: `cpu: 600m`

#### `spec.resources.limits.memory`
App will be killed if exceeding this limit.

**Default**: 512Mi

**Allowed values**: `^\d+[KMG]i$`

**Example**: `memory: 512Mi`

### `spec.resources.requests`
App is guaranteed the requested resources and will be scheduled on nodes with at least this amount of resources available.

#### `spec.resources.requests.cpu`
Guaranteed amount of CPU.

**Default**: 200m

**Allowed values**: `^\d+m?$`

**Example**: `cpu: 300m`

#### `spec.resources.requests.memory`
Guaranteed amount of memory.

**Default**: 256Mi

**Allowed values**: `^\d+[KMG]i$`

**Example**: `memory: 512Mi`

## `spec.ingresses`
List of ingress URLs that will route HTTP traffic to the application.

Depending on where your application is running, check out [On-premises/Accessing the application](../clusters/on-premises.md#accessing-the-application) or
[Google Cloud Platform/Accessing the application](../clusters/gcp.md#accessing-the-application) for more info on which ingresses to use.

## `spec.vault`
Provides secrets management, identity-based access, and encrypting application data for auditing of secrets for applications, systems, and users. Vault documentation can be found in [navikt/vault-iac](https://github.com/navikt/vault-iac/tree/master/doc).

### `spec.vault.enabled`
If set to true, fetch secrets from Vault and inject into the pods.

**Default**: `false`

### `spec.vault.sidecar`
If set to true, will extend tokens time to live.

**Default**: `false`

### `spec.vault.paths[]`
Overriding the `paths` array is optional, and will give you fine-grained control over which vault paths that will be
mounted on the file system. Just remember that the default vaules will be overridden, and that you need to add them
yourself if you have other secrets.

#### `spec.vault.paths[].kvPath`
Path to Vault key/value store that should be mounted into the file system.

**Default**: `/kv/environment/zone/application/namespace`

#### `spec.vault.paths[].mountPath`
File system path that the secrets will be mounted into.

**Default**: `/var/run/secrets/nais.io/vault`

## `spec.filesFrom[]`
List of ConfigMap or Secret resources that will have their contents mounted into the containers as files. Either
`configmap` or `secret` is required. The resource must exist in the same namespace as the application.

### `spec.filesFrom[].configmap`
Will expose the configmap as files under `spec.filesFrom[].mountPath`.

### `spec.filesFrom[].secret`
Will expose the secret as files under `spec.filesFrom[].mountPath`. Putting this information in a secret is safer and
more flexible than putting it verbatim in a Pod definition or in a container image. See
[addons/secrets](../addons/secrets.md) for more information.

### `spec.filesFrom[].mountPath`
Path to where files will be mounted.

**Default (configmap)**: `/var/run/configmaps/<configmap-name>`

**Default (secret)**: `/var/run/secrets`

## `spec.envFrom[]`
Will expose all variables in configmap or secret resource as environment variables. One of `configmap` or `secret` is
required.

### `spec.envFrom[].configmap`

### `spec.envFrom[].secret`
Putting this information in a secret is safer and more flexible than putting it verbatim in a Pod definition or in a
container image. See [addons/secrets](../addons/secrets.md) for more information.

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
Format of the logs from the container. Use this if the container doesn't support json logging and the log is in a special format that need to be parsed. Supported formats: accesslog, accesslog_with_processing_time, accesslog_with_referer_useragent, capnslog, logrus, gokit, redis, glog, simple, influxdb, log15.

## `spec.logtransform`
Extra filters for modifying log content. This can e.g. be used for setting loglevel based on http status code. Supported filters: http_loglevel, dns_loglevel

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

#### `spec.accessPolicy.outbound.rules[].application`
Name of the other service to allow traffic to.

**Required**: `true`

### `spec.accessPolicy.outbound.external[]`
List of services outside cluster to allow traffic to.

#### `spec.accessPolicy.outbound.external[].host`
URL to service outside cluster.

**Required**: `true`

#### `spec.accessPolicy.outbound.external[].ports[]`
List of outgoing ports allowed for service outside cluster.

##### `spec.accessPolicy.outbound.external[].ports[].port`
Port number of outgoing port.

##### `spec.accessPolicy.outbound.external[].ports[].protocol`
The protocol exposed on the port. MUST BE one of `HTTP|HTTPS|GRPC|HTTP2|MONGO|TCP|TLS`. TLS implies the connection will be routed based on the SNI header to the destination without terminating the TLS connection.

## `spec.gcp.sqlInstances`
List of sql instances to provision in GCP

See [postgres](../gcp/postgres.md)-doc for more details

### `spec.gcp.sqlInstances[].type`
Database type. Only POSTGRES_11 available atm.
[List of database types GCP supports](https://cloud.google.com/sql/docs/mysql/admin-api/rest/v1beta4/SqlDatabaseVersion)

### `spec.gcp.sqlInstances[].name`
Name of the sql instance

**Default**: `metadata.name`

### `spec.gcp.sqlInstances[].tier`
Tier of the instance.
Format: db-custom-<cpus>-<memoryMb> | db-f1-micro | db-g1-small
[examples](https://cloud.google.com/sql/docs/postgres/create-instance#machine-types)

**Default**: `db-f1-micro`

### `spec.gcp.sqlInstances[].diskType`
disk type, can be ssd or hdd

**Default**: `ssd`

### `spec.gcp.sqlInstances[].highAvailability`
Whether the instance should be set up with replication to another zone
https://cloud.google.com/sql/docs/postgres/high-availability

**Default**: `false`

### `spec.gcp.sqlInstances[].diskSize`
How much storage the instance should be provisioned with in GiB.

**Default**: `10`

### `spec.gcp.sqlInstances[].diskAutoresize`
Whether the disk should automatically grow

**Default**: `false`

### `spec.gcp.sqlInstances[].autoBackupTime`
When the instance should create backups.

**Default**: `02:00`

### `spec.gcp.sqlInstances[].cascadingDelete`
Whether the instance should be deleted if the application is deleted

**Default**: `false`

### `spec.gcp.sqlInstances[].databases`
List of databases on this instance

#### `spec.gcp.sqlInstances[].databases[].name`
Name of the database

**Required**: `true`

## `spec.gcp.buckets`
List of buckets to provision in gcp


### `spec.gcp.buckets[].namePrefix`
Name prefix of the bucket, will be postfixed with a random string and exposed to the container. See [buckets](../gcp/buckets.md) for more details

**Required**: `true`

### `spec.gcp.buckets[].cascadingDelete`
Whether the instance should be deleted if the application is deleted

**Default**: `false`

## `spec.azure.application`
Configures an Azure AD application for this application. See [Azure AD](../addons/azure-ad.md) for more details.

### `spec.azure.application.enabled`
If enabled, will provision an Azure AD application for the application.

**Default**: `false`

### `spec.azure.application.replyURLs[]`
List of [reply URLs](https://docs.microsoft.com/en-us/azure/active-directory/develop/reply-url) that should be registered for the Azure AD application, 
e.g. `[ "https://my.application/oauth2/callback" ]`

**Default**: `[]`

{% hint style="info" %}
Note that `spec.azure.application.replyURLs[]` can be omitted if `spec.ingresses` are specified.

See [Reply URLs](../addons/azure-ad.md#reply-urls) for details.
{% endhint %}
