---
description: The NAIS manifest nais.yaml describes your application
---

# Reference

## `metadata.name`

Name of the application.

**Required**: `true`

## `metadata.namespace`

Which namespace the application will be deployed to.

**Default**: default

!!! info
    It is recommended to use [team namespaces](../../clusters/team-namespaces.md) instead of using the default namespace.

## `metadata.labels.team`

The name of the [team](../../basics/teams.md) that owns this application \(lowercase only!\).

**Required**: `true`

**Allowed values**: `([a-z0-9\-])+` team name starting with a letter and only lowercase letters, numbers and dashes is allowed

## `spec.accessPolicy` \(GCP only\)

Default will not allow any traffic to or from application. [Access policy](../access-policy.md) is currently supported in GKE clusters, only.

### `spec.accessPolicy.inbound.rules[]`

List of services to allow traffic from.

#### `spec.accessPolicy.inbound.rules[].application`

Name of the application to allow traffic from.

**Required**: `true`

#### `spec.accessPolicy.inbound.rules[].cluster`

Cluster to allow [token exchanging](../../security/auth/tokenx.md#getting-started) or [pre-authorization](../../security/auth/azure-ad.md#pre-authorization) for inter-cluster communication with tokens.

**This applies** _**only**_ **if using** [**TokenX**](../../security/auth/tokenx.md) **or** [**Azure AD**](../../security/auth/azure-ad.md)**.**

#### `spec.accessPolicy.inbound.rules[].namespace`

Namespace to application to allow traffic from.

**Default**: `metadata.namespace`

### `spec.accessPolicy.outbound.external[]`

List of services outside cluster to allow traffic to.

#### `spec.accessPolicy.outbound.external[].host`

URL to service outside cluster.

**Required**: `true`

#### `spec.accessPolicy.outbound.external[].ports[]`

List of outgoing ports allowed for service outside cluster.

**spec.accessPolicy.outbound.external\[\].ports\[\].port**

Port number of outgoing port.

**spec.accessPolicy.outbound.external\[\].ports\[\].protocol**

The protocol exposed on the port. MUST BE one of `HTTP|HTTPS|GRPC|HTTP2|MONGO|TCP|TLS`. TLS implies the connection will be routed based on the SNI header to the destination without terminating the TLS connection.

### `spec.accessPolicy.outbound.rules[]`

List of services to allow traffic to.

#### `spec.accessPolicy.outbound.rules[].application`

Name of the other service to allow traffic to.

**Required**: `true`

#### `spec.accessPolicy.outbound.rules[].namespace`

Namespace to application to allow traffic to.

**Default**: `metadata.namespace`


## `spec.azure.application`

Configures an Azure AD client for this application. See [Azure AD](../../security/auth/azure-ad.md) for more details.

### `spec.azure.application.enabled`

If enabled, will provision an Azure AD client for the application.

**Default**: `false`

### `spec.azure.application.replyURLs[]`

List of [reply URLs](https://docs.microsoft.com/en-us/azure/active-directory/develop/reply-url) that should be registered for the Azure AD client, e.g. `[ "https://my.application/oauth2/callback" ]`

**Default**: `[]`

!!! info
    Note that `spec.azure.application.replyURLs[]` can be omitted if `spec.ingresses` are specified.

    See [Reply URLs](../../security/auth/azure-ad.md#reply-urls) for details.

### `spec.azure.application.tenant`

Explicitly target a given [tenant](../../security/auth/azure-ad.md#tenants) in Azure AD.

**Default**: `nav.no`

**Allowed values**: enum of `{trygdeetaten.no, nav.no}`

## `spec.env[]`

Custom environment variables injected into your container.

### `spec.env[].name`

Environment variable name.

**Required**: `true`

### `spec.env[].value`

Environment variable value.

**Required**: `true`

## `spec.envFrom[]`

Will expose all variables in configmap or secret resource as environment variables. One of `configmap` or `secret` is required.

### `spec.envFrom[].configmap`

### `spec.envFrom[].secret`

Putting this information in a secret is safer and more flexible than putting it verbatim in a Pod definition or in a container image. See [addons/secrets](../../security/secrets/kubernetes-secrets.md) for more information.

## `spec.filesFrom[]`

List of ConfigMap or Secret resources that will have their contents mounted into the containers as files. Either `configmap` or `secret` is required. The resource must exist in the same namespace as the application.

### `spec.filesFrom[].configmap`

Will expose the configmap as files under `spec.filesFrom[].mountPath`.

### `spec.filesFrom[].secret`

Will expose the secret as files under `spec.filesFrom[].mountPath`. Putting this information in a secret is safer and more flexible than putting it verbatim in a Pod definition or in a container image. See [addons/secrets](../../security/secrets/kubernetes-secrets.md) for more information.

### `spec.filesFrom[].mountPath`

Path to where files will be mounted.

**Default \(configmap\)**: `/var/run/configmaps/<configmap-name>`

**Default \(secret\)**: `/var/run/secrets`

## `spec.gcp.sqlInstances`

List of sql instances to provision in GCP

See [postgres](../../persistence/postgres.md)-doc for more details

### `spec.gcp.sqlInstances[].type`

Database type. Only POSTGRES\_11 available atm. [List of database types GCP supports](https://cloud.google.com/sql/docs/mysql/admin-api/rest/v1beta4/SqlDatabaseVersion)

### `spec.gcp.sqlInstances[].name`

Name of the sql instance

**Default**: `metadata.name`

### `spec.gcp.sqlInstances[].tier`

Tier of the instance. Format: db-custom-- \| db-f1-micro \| db-g1-small [examples](https://cloud.google.com/sql/docs/postgres/create-instance#machine-types)

**Default**: `db-f1-micro`

### `spec.gcp.sqlInstances[].diskType`

disk type, can be ssd or hdd

**Default**: `ssd`

### `spec.gcp.sqlInstances[].highAvailability`

Whether the instance should be set up with replication to another zone [https://cloud.google.com/sql/docs/postgres/high-availability](https://cloud.google.com/sql/docs/postgres/high-availability)

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

!!! danger
    When you delete an Cloud SQL instance, you cannot reuse the name of the deleted instance until one week from the deletion date.

**Default**: `false`

### `spec.gcp.sqlInstances[].databases`

List of databases on this instance

#### `spec.gcp.sqlInstances[].databases[].name`

Name of the database

**Required**: `true`

#### `spec.gcp.sqlInstances[].databases[].envVarPrefix`

You can customize the environment variable name prefix that is generated for your instance.

Setting this to DB will give you DB\_HOST, DB\_USERNAME, etc.

**Default**: Application name

## `spec.gcp.buckets`

List of buckets to provision in gcp

### `spec.gcp.buckets[].namePrefix`

Name prefix of the bucket, will be postfixed with a random string and exposed to the container. See [buckets](../../persistence/buckets.md) for more details

**Required**: `true`

### `spec.gcp.buckets[].cascadingDelete`

Whether the instance should be deleted if the application is deleted

**Default**: `false`

## `spec.idporten`

Configures an ID-porten client for this application. See [ID-porten](../../security/auth/idporten.md) for more details.

### `spec.idporten.enabled`

If enabled, will provision an ID-porten client for the application.

**Default**: `false`

### `spec.idporten.clientURI`

The URL shown to the user at ID-porten when displaying a 'back' button or on errors.

**Default**: `https://www.nav.no`

### `spec.idporten.frontchannelLogoutURI`

Where ID-porten sends a request to whenever the user has initiated a logout elsewhere as part of a [single logout \(front channel logout\)](https://difi.github.io/felleslosninger/oidc_func_sso.html#motta-informasjon-om-slo-front-channel-logout) process, e.g. `"https://my.application.ingress/oauth2/logout"`

**Default**: `(no value)`

**Required**: `false`

### `spec.idporten.postLogoutRedirectURIs[]`

Valid URIs that ID-porten will allow redirecting the end-user to after a [single logout](https://difi.github.io/felleslosninger/oidc_func_sso.html#initiering-av-slo-session-management) has been initiated and performed by the application.

Example: `[ "https://my.application.ingress/" ]`

**Default**: `[ "https://www.nav.no" ]`

### `spec.idporten.redirectURI`

Valid URI that ID-porten redirects back to after a successful authorization request, e.g. `"https://my.application.ingress/oauth2/callback"`.

The value of this **must** be a subpath of your application's ingress.

**Default**: `spec.ingresses[0]` + `/oauth2/callback`

!!! info
    Note that `spec.idporten.redirectURI` can only be omitted if `spec.ingresses` are specified.

    See [Redirect URIs](../../security/auth/idporten.md#redirect-uri) for details.

### `spec.idporten.sessionLifetime`
The maximum lifetime in seconds for any given user's session in your application. The timeout starts whenever the user is redirected from the `authorization_endpoint` at ID-porten. Attempting to refresh the user's `access_token` beyond this timeout will yield an error. 

**Default**: `7200` \(2 hours\)

**Minimum value**: `3600`

**Maximum value**: `7200`

### `spec.idporten.accessTokenLifetime`

The lifetime in seconds for any issued access token from ID-porten.

**Default**: `3600` \(2 hours\)

**Minimum value**: `1`

**Maximum value**: `3600`


## `spec.image`

Docker image location plus including docker tag \(e.g. `docker.pkg.github.com/appname/appname:v1.0.0`\)

**Required**: `true`

## `spec.ingresses`

List of ingress URLs that will route HTTP traffic to the application.

Depending on where your application is running, check out [On-premises/Accessing the application](../../clusters/on-premises.md#accessing-the-application) or [Google Cloud Platform/Accessing the application](../../clusters/gcp.md#accessing-the-application) for more info on which ingresses to use.

## `spec.liveness`

Many applications running for long periods of time eventually transition to broken states, and cannot recover except by being restarted. Kubernetes provides liveness probes to detect and remedy such situations. Read more about this over at the [Kubernetes probes documentation](https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/).

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

How often \(in seconds\) to perform the probe.

**Default**: 10

### `spec.liveness.failureThreshold`

When a Pod starts and the probe fails, Kubernetes will try `failureThreshold` times before giving up. Giving up in case of liveness probe means restarting the Pod.

**Default**: 3

## `spec.maskinporten`
Configures a Maskinporten client for this application. See [Maskinporten](../../security/auth/maskinporten.md) for more details.

### `spec.maskinporten.enabled`
If enabled, will provision a Maskinporten client for the application.

**Default**: `false`

### `spec.maskinporten.scopes[].scope`
Valid list of scopes that the Maskinporten client can use.

**Required**: `true`

!!! info
    See [Maskinporten Scopes](../../security/auth/maskinporten.md#scopes) for more details.

## `spec.port`

The port number which is exposed by the container and should receive HTTP traffic.

**Default**: 8080

## `spec.strategy.type`

Specifies the strategy used to replace old Pods by new ones.

**Default**: RollingUpdate

## `spec.readiness`

Sometimes, applications are temporarily unable to serve traffic. For example, an application might need to load large data or configuration files during startup, or depend on external services after startup. In such cases, you don't want to kill the application, but you don’t want to send it requests either. Kubernetes provides readiness probes to detect and mitigate these situations. A pod with containers reporting that they are not ready does not receive traffic through Kubernetes Services. Read more about this over at the [Kubernetes readiness documentation](https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/).

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

Sometimes, you have to deal with legacy applications that might require an additional startup time on their first initialization. In such cases, it can be tricky to set up liveness probe parameters without compromising the fast response to deadlocks that motivated such a probe. The trick is to set up a startup probe with the same command, HTTP or TCP check, with a failureThreshold \* periodSeconds long enough to cover the worse case startup time. Read more about this over at the [Kubernetes startup probe documentation](https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/#define-startup-probes).

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

How often \(in seconds\) to perform the probe.

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

### `spec.replicas.cpuThresholdPercentage`

The total CPU percentage threshold for the [Horizontal Pod Autoscaler \(HPA\)](https://kubernetes.io/docs/tasks/run-application/horizontal-pod-autoscale/). In short, if the current number of replicas for a deployment is below the maximum number of replicas set in `spec.replicas.max`, the HPA will automatically increase the number of replicas whenever the average CPU utilization across all replicas reach this threshold percentage of the [requested](reference.md#specresourcesrequests) CPU resources.

We recommend to read more about [container lifecycle hooks](https://kubernetes.io/docs/concepts/containers/container-lifecycle-hooks/).

**Default**: `50`

## `spec.prometheus`

Prometheus is used to scrape [metrics](../../observability/metrics.md) from the pod.

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

## `spec.tracing`

Configuration of [tracing](../../observability/tracing.md).

### `spec.tracing.enabled`

Allow network egress to the Jaeger tracing app and configures istio-proxy to trace all incoming requests.

Boolean value.

**Default**: false

## `spec.vault`

Provides secrets management, identity-based access, and encrypting application data for auditing of secrets for applications, systems, and users. Vault documentation can be found in [navikt/vault-iac](https://github.com/navikt/vault-iac/tree/master/doc).

### `spec.vault.enabled`

If set to true, fetch secrets from Vault and inject into the pods.

**Default**: `false`

### `spec.vault.sidecar`

If set to true, will extend tokens time to live.

**Default**: `false`

### `spec.vault.paths[]`

Overriding the `paths` array is optional, and will give you fine-grained control over which Vault paths that will be mounted on the file system. Refer to the [Vault documentation](https://github.com/navikt/vault-iac/tree/master/doc) for details. The default path specified below will always be attemped to be mounted.

#### `spec.vault.paths[].kvPath`

Path to Vault key/value store that should be mounted into the file system.

**Default**: `/kv/<environment>/<zone>/<application>/<namespace>`

#### `spec.vault.paths[].mountPath`

File system path that the secrets will be mounted into.

**Default**: `/var/run/secrets/nais.io/vault`

## `spec.preStopHookPath`

A HTTP GET will be issued to this endpoint at least once before the pod is terminated.
Read more under [nais-application](../README.md#handles-termination-gracefully).

## `spec.leaderElection`

If true, a HTTP endpoint will be available at `$ELECTOR_PATH` that returns the current leader. Read more about leader election in [addons/leader election](../../addons/leader-election.md).

**Default**: `false`

## `spec.webproxy`

Expose web proxy configuration to the application using the `$HTTP_PROXY`, `$HTTPS_PROXY` and `$NO_PROXY` environment variables.

**Default**: `false`

## `spec.logformat`

Format of the logs from the container. Use this if the container doesn't support json logging and the log is in a special format that need to be parsed. Supported formats: accesslog, accesslog\_with\_processing\_time, accesslog\_with\_referer\_useragent, capnslog, logrus, gokit, redis, glog, simple, influxdb, log15.

## `spec.logtransform`

Extra filters for modifying log content. This can e.g. be used for setting loglevel based on http status code. Supported filters: http\_loglevel, dns\_loglevel

## `spec.secureLogs.enabled`

If true, mount a volume for secure logs in the pod.

**Default**: `false`

## `spec.service.port`

Port for the default service.

**Default**: 80

## `spec.skipCaBundle`

If true, no certificate authority bundle will be injected.

**Default**: `false`

## `spec.tokenx.enabled`
Toggle for enabling [TokenX](../../security/auth/tokenx.md) for your application.

**Default**: `false`
