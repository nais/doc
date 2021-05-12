# NAIS application

ApplicationSpec contains the NAIS manifest. Please keep this list sorted for clarity.

Path: _no value_<br />
Type: `object`<br />
Required: `false`<br />

## accessPolicy

By default, all traffic is disallowed between applications inside the cluster. Configure access policies to allow specific applications.

Path: `.accessPolicy`<br />
Type: `object`<br />
Required: `false`<br />
Availability: GCP<br />

### inbound

Path: `.accessPolicy.inbound`<br />
Type: `object`<br />
Required: `false`<br />

#### rules

Path: `.accessPolicy.inbound.rules[]`<br />
Type: `array`<br />
Required: `true`<br />

##### application

Path: `.accessPolicy.inbound.rules[].application`<br />
Type: `string`<br />
Required: `false`<br />

##### cluster

Path: `.accessPolicy.inbound.rules[].cluster`<br />
Type: `string`<br />
Required: `false`<br />

##### namespace

Path: `.accessPolicy.inbound.rules[].namespace`<br />
Type: `string`<br />
Required: `false`<br />

### outbound

Path: `.accessPolicy.outbound`<br />
Type: `object`<br />
Required: `false`<br />

#### external

Path: `.accessPolicy.outbound.external[]`<br />
Type: `array`<br />
Required: `false`<br />

##### host

Path: `.accessPolicy.outbound.external[].host`<br />
Type: `string`<br />
Required: `false`<br />

##### ports

Path: `.accessPolicy.outbound.external[].ports[]`<br />
Type: `array`<br />
Required: `false`<br />

###### name

Path: `.accessPolicy.outbound.external[].ports[].name`<br />
Type: `string`<br />
Required: `false`<br />

###### port

Path: `.accessPolicy.outbound.external[].ports[].port`<br />
Type: `integer`<br />
Required: `false`<br />

###### protocol

Path: `.accessPolicy.outbound.external[].ports[].protocol`<br />
Type: `enum`<br />
Required: `false`<br />
Allowed values:<br />
  * `HTTP`
  * `HTTPS`
  * `GRPC`
  * `HTTP2`
  * `MONGO`
  * `TCP`
  * `TLS`

#### rules

Path: `.accessPolicy.outbound.rules[]`<br />
Type: `array`<br />
Required: `false`<br />

##### application

Path: `.accessPolicy.outbound.rules[].application`<br />
Type: `string`<br />
Required: `false`<br />

##### cluster

Path: `.accessPolicy.outbound.rules[].cluster`<br />
Type: `string`<br />
Required: `false`<br />

##### namespace

Path: `.accessPolicy.outbound.rules[].namespace`<br />
Type: `string`<br />
Required: `false`<br />

## azure

Path: `.azure`<br />
Type: `object`<br />
Required: `false`<br />

### application

Configures an Azure AD client for this application. See [Azure AD](https://doc.nais.io/security/auth/azure-ad/) for more details.

Path: `.azure.application`<br />
Type: `object`<br />
Required: `true`<br />

#### claims

Claims defines additional configuration of the emitted claims in tokens returned to the AzureAdApplication

Path: `.azure.application.claims`<br />
Type: `object`<br />
Required: `false`<br />

##### extra

Extra is a list of additional claims to be mapped from an associated claim-mapping policy.

Path: `.azure.application.claims.extra[]`<br />
Type: `array`<br />
Required: `false`<br />

##### groups

Groups is a list of Azure AD group IDs to be emitted in the 'Groups' claim.

Path: `.azure.application.claims.groups[]`<br />
Type: `array`<br />
Required: `false`<br />

###### id

Path: `.azure.application.claims.groups[].id`<br />
Type: `string`<br />
Required: `false`<br />

#### enabled

Path: `.azure.application.enabled`<br />
Type: `boolean`<br />
Required: `true`<br />
Default value: `false`<br />

#### replyURLs

Path: `.azure.application.replyURLs[]`<br />
Type: `array`<br />
Required: `false`<br />

#### tenant

Path: `.azure.application.tenant`<br />
Type: `enum`<br />
Required: `false`<br />
Allowed values:<br />
  * `nav.no`
  * `trygdeetaten.no`

## elastic

Path: `.elastic`<br />
Type: `object`<br />
Required: `false`<br />

### instance

Provisions an Elasticsearch instance and configures your application so it can access it. Use the `instance_name` that you specified in the [navikt/aiven-iac](https://github.com/navikt/aiven-iac) repository.

Path: `.elastic.instance`<br />
Type: `string`<br />
Required: `true`<br />
Availability: GCP<br />

## env

Custom environment variables injected into your container.

Path: `.env[]`<br />
Type: `array`<br />
Required: `false`<br />

### name

Path: `.env[].name`<br />
Type: `string`<br />
Required: `false`<br />
Example value: `MY_CUSTOM_VAR`<br />

### value

Path: `.env[].value`<br />
Type: `string`<br />
Required: `false`<br />
Example value: `some_value`<br />

### valueFrom

Path: `.env[].valueFrom`<br />
Type: `object`<br />
Required: `false`<br />

#### fieldRef

Path: `.env[].valueFrom.fieldRef`<br />
Type: `object`<br />
Required: `true`<br />

##### fieldPath

Path: `.env[].valueFrom.fieldRef.fieldPath`<br />
Type: `enum`<br />
Required: `true`<br />
Allowed values:<br />
  * _no value_
  * `metadata.name`
  * `metadata.namespace`
  * `metadata.labels`
  * `metadata.annotations`
  * `spec.nodeName`
  * `spec.serviceAccountName`
  * `status.hostIP`
  * `status.podIP`

## envFrom

Will expose all variables in ConfigMap or Secret resource as environment variables. One of `configmap` or `secret` is required.

Path: `.envFrom[]`<br />
Type: `array`<br />
Required: `false`<br />
Availability: team namespaces<br />

### configmap

Path: `.envFrom[].configmap`<br />
Type: `string`<br />
Required: `false`<br />
Example value: `configmap-with-envs`<br />

### secret

Path: `.envFrom[].secret`<br />
Type: `string`<br />
Required: `false`<br />
Example value: `secret-with-envs`<br />

## filesFrom

List of ConfigMap or Secret resources that will have their contents mounted into the containers as files. Either `configmap` or `secret` is required.

Path: `.filesFrom[]`<br />
Type: `array`<br />
Required: `false`<br />
Availability: team namespaces<br />

### configmap

Path: `.filesFrom[].configmap`<br />
Type: `string`<br />
Required: `false`<br />
Example value: `example-files-configmap`<br />

### mountPath

Path: `.filesFrom[].mountPath`<br />
Type: `string`<br />
Required: `false`<br />
Example value: `/var/run/secrets`<br />

### secret

Path: `.filesFrom[].secret`<br />
Type: `string`<br />
Required: `false`<br />
Example value: `my-secret-file`<br />

## gcp

Path: `.gcp`<br />
Type: `object`<br />
Required: `false`<br />
Availability: GCP<br />

### buckets

Provision cloud storage buckets and connect them to your application.

Path: `.gcp.buckets[]`<br />
Type: `array`<br />
Required: `false`<br />

#### cascadingDelete

Path: `.gcp.buckets[].cascadingDelete`<br />
Type: `boolean`<br />
Required: `false`<br />

#### lifecycleCondition

Path: `.gcp.buckets[].lifecycleCondition`<br />
Type: `object`<br />
Required: `false`<br />

##### age

Path: `.gcp.buckets[].lifecycleCondition.age`<br />
Type: `integer`<br />
Required: `false`<br />

##### createdBefore

Path: `.gcp.buckets[].lifecycleCondition.createdBefore`<br />
Type: `string`<br />
Required: `false`<br />

##### numNewerVersions

Path: `.gcp.buckets[].lifecycleCondition.numNewerVersions`<br />
Type: `integer`<br />
Required: `false`<br />

##### withState

Path: `.gcp.buckets[].lifecycleCondition.withState`<br />
Type: `string`<br />
Required: `false`<br />

#### name

Path: `.gcp.buckets[].name`<br />
Type: `string`<br />
Required: `false`<br />

#### retentionPeriodDays

Path: `.gcp.buckets[].retentionPeriodDays`<br />
Type: `integer`<br />
Required: `false`<br />
Value range: `1`-`36500`<br />

### permissions

List of _additional_ permissions that should be granted to your application for accessing external GCP resources that have not been provisioned through NAIS. [Supported resources found here](https://cloud.google.com/config-connector/docs/reference/resource-docs/iam/iampolicymember#external_organization_level_policy_member).

Path: `.gcp.permissions[]`<br />
Type: `array`<br />
Required: `false`<br />

#### resource

Path: `.gcp.permissions[].resource`<br />
Type: `object`<br />
Required: `false`<br />

##### apiVersion

Path: `.gcp.permissions[].resource.apiVersion`<br />
Type: `string`<br />
Required: `true`<br />

##### kind

Path: `.gcp.permissions[].resource.kind`<br />
Type: `string`<br />
Required: `true`<br />

##### name

Path: `.gcp.permissions[].resource.name`<br />
Type: `string`<br />
Required: `false`<br />

#### role

Path: `.gcp.permissions[].role`<br />
Type: `string`<br />
Required: `false`<br />

### sqlInstances

Provision database instances and connect them to your application. See [PostgreSQL documentation](https://doc.nais.io/persistence/postgres/) for more details.

Path: `.gcp.sqlInstances[]`<br />
Type: `array`<br />
Required: `false`<br />

#### autoBackupHour

Path: `.gcp.sqlInstances[].autoBackupHour`<br />
Type: `integer`<br />
Required: `false`<br />
Value range: `0`-`23`<br />

#### cascadingDelete

Path: `.gcp.sqlInstances[].cascadingDelete`<br />
Type: `boolean`<br />
Required: `false`<br />

#### collation

Path: `.gcp.sqlInstances[].collation`<br />
Type: `string`<br />
Required: `false`<br />

#### databases

Path: `.gcp.sqlInstances[].databases[]`<br />
Type: `array`<br />
Required: `false`<br />

##### envVarPrefix

Path: `.gcp.sqlInstances[].databases[].envVarPrefix`<br />
Type: `string`<br />
Required: `false`<br />

##### name

Path: `.gcp.sqlInstances[].databases[].name`<br />
Type: `string`<br />
Required: `false`<br />

##### users

Path: `.gcp.sqlInstances[].databases[].users[]`<br />
Type: `array`<br />
Required: `false`<br />

###### name

Path: `.gcp.sqlInstances[].databases[].users[].name`<br />
Type: `string`<br />
Required: `false`<br />
Pattern: `^[_a-zA-Z][_a-zA-Z0-9]+$`<br />

#### diskAutoresize

Path: `.gcp.sqlInstances[].diskAutoresize`<br />
Type: `boolean`<br />
Required: `false`<br />

#### diskSize

Path: `.gcp.sqlInstances[].diskSize`<br />
Type: `integer`<br />
Required: `false`<br />
Value range: `10`-`+Inf`<br />

#### diskType

Path: `.gcp.sqlInstances[].diskType`<br />
Type: `enum`<br />
Required: `false`<br />
Allowed values:<br />
  * `SSD`
  * `HDD`

#### highAvailability

Path: `.gcp.sqlInstances[].highAvailability`<br />
Type: `boolean`<br />
Required: `false`<br />

#### maintenance

Path: `.gcp.sqlInstances[].maintenance`<br />
Type: `object`<br />
Required: `false`<br />

##### day

Path: `.gcp.sqlInstances[].maintenance.day`<br />
Type: `integer`<br />
Required: `false`<br />
Value range: `1`-`7`<br />

##### hour

Path: `.gcp.sqlInstances[].maintenance.hour`<br />
Type: `integer`<br />
Required: `false`<br />
Value range: `0`-`23`<br />

#### name

Path: `.gcp.sqlInstances[].name`<br />
Type: `string`<br />
Required: `false`<br />

#### tier

Path: `.gcp.sqlInstances[].tier`<br />
Type: `string`<br />
Required: `false`<br />
Pattern: `db-.+`<br />

#### type

Path: `.gcp.sqlInstances[].type`<br />
Type: `enum`<br />
Required: `false`<br />
Allowed values:<br />
  * `POSTGRES_11`
  * `POSTGRES_12`

## idporten

Configures an ID-porten client for this application. See [ID-porten](https://doc.nais.io/security/auth/idporten/) for more details.

Path: `.idporten`<br />
Type: `object`<br />
Required: `false`<br />

### accessTokenLifetime

Path: `.idporten.accessTokenLifetime`<br />
Type: `integer`<br />
Required: `false`<br />
Value range: `1`-`3600`<br />

### clientURI

Path: `.idporten.clientURI`<br />
Type: `string`<br />
Required: `false`<br />

### enabled

Path: `.idporten.enabled`<br />
Type: `boolean`<br />
Required: `true`<br />

### frontchannelLogoutPath

Path: `.idporten.frontchannelLogoutPath`<br />
Type: `string`<br />
Required: `false`<br />
Pattern: `^\/.*$`<br />

### frontchannelLogoutURI

Path: `.idporten.frontchannelLogoutURI`<br />
Type: `string`<br />
Required: `false`<br />

### postLogoutRedirectURIs

Path: `.idporten.postLogoutRedirectURIs[]`<br />
Type: `array`<br />
Required: `false`<br />

### redirectPath

Path: `.idporten.redirectPath`<br />
Type: `string`<br />
Required: `false`<br />
Pattern: `^\/.*$`<br />

### redirectURI

Path: `.idporten.redirectURI`<br />
Type: `string`<br />
Required: `false`<br />
Pattern: `^https:\/\/.+$`<br />

### sessionLifetime

Path: `.idporten.sessionLifetime`<br />
Type: `integer`<br />
Required: `false`<br />
Value range: `3600`-`7200`<br />

## image

Your application's Docker image location and tag.

Path: `.image`<br />
Type: `string`<br />
Required: `true`<br />
Example value: `ghcr.io/navikt/myapp:1.6.9`<br />

## ingresses

List of URLs that will route HTTPS traffic to the application. All URLs must start with `https://`. Domain availability differs according to which environment your application is running in, see https://doc.nais.io/clusters/gcp/ and https://doc.nais.io/clusters/on-premises/.

Path: `.ingresses[]`<br />
Type: `array`<br />
Required: `false`<br />

## kafka

Enable Aiven Kafka for your application.

Path: `.kafka`<br />
Type: `object`<br />
Required: `false`<br />

### pool

Configures your application to access an Aiven Kafka cluster. See https://doc.nais.io/addons/kafka/.

Path: `.kafka.pool`<br />
Type: `enum`<br />
Required: `true`<br />
Allowed values:<br />
  * `nav-dev`
  * `nav-prod`
  * `nav-infrastructure`

## leaderElection

If true, an HTTP endpoint will be available at `$ELECTOR_PATH` that returns the current leader. See https://doc.nais.io/addons/leader-election/.

Path: `.leaderElection`<br />
Type: `boolean`<br />
Required: `false`<br />

## liveness

Many applications running for long periods of time eventually transition to broken states, and cannot recover except by being restarted. Kubernetes provides liveness probes to detect and remedy such situations. Read more about this over at the [Kubernetes probes documentation](https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/).

Path: `.liveness`<br />
Type: `object`<br />
Required: `false`<br />

### failureThreshold

When a Pod starts, and the probe fails, Kubernetes will try _failureThreshold_ times before giving up. Giving up in case of a startup probe means restarting the Pod.

Path: `.liveness.failureThreshold`<br />
Type: `integer`<br />
Required: `false`<br />
Default value: `3`<br />

### initialDelay

Number of seconds after the container has started before startup probes are initiated.

Path: `.liveness.initialDelay`<br />
Type: `integer`<br />
Required: `false`<br />
Example value: `20`<br />

### path

HTTP endpoint path that signals 200 OK if the application has started successfully.

Path: `.liveness.path`<br />
Type: `string`<br />
Required: `true`<br />
Example value: `/isalive`<br />

### periodSeconds

How often (in seconds) to perform the probe.

Path: `.liveness.periodSeconds`<br />
Type: `integer`<br />
Required: `false`<br />
Default value: `10`<br />

### port

Port for the startup probe.

Path: `.liveness.port`<br />
Type: `integer`<br />
Required: `false`<br />
Example value: `http`<br />

### timeout

Number of seconds after which the probe times out.

Path: `.liveness.timeout`<br />
Type: `integer`<br />
Required: `false`<br />
Default value: `1`<br />

## logformat

Format of the logs from the container. Use this if the container doesn't support JSON logging and the log is in a special format that need to be parsed.

Path: `.logformat`<br />
Type: `enum`<br />
Required: `false`<br />
Allowed values:<br />
  * _no value_
  * `accesslog`
  * `accesslog_with_processing_time`
  * `accesslog_with_referer_useragent`
  * `capnslog`
  * `logrus`
  * `gokit`
  * `redis`
  * `glog`
  * `simple`
  * `influxdb`
  * `log15`

## logtransform

Extra filters for modifying log content. This can e.g. be used for setting loglevel based on http status code.

Path: `.logtransform`<br />
Type: `enum`<br />
Required: `false`<br />
Allowed values:<br />
  * `http_loglevel`
  * `dns_loglevel`

## maskinporten

Configures a Maskinporten client for this application. See [Maskinporten](https://doc.nais.io/security/auth/maskinporten/) for more details.

Path: `.maskinporten`<br />
Type: `object`<br />
Required: `false`<br />

### enabled

Path: `.maskinporten.enabled`<br />
Type: `boolean`<br />
Required: `true`<br />

### scopes

Path: `.maskinporten.scopes[]`<br />
Type: `array`<br />
Required: `false`<br />

#### name

Path: `.maskinporten.scopes[].name`<br />
Type: `string`<br />
Required: `false`<br />

## port

The port number which is exposed by the container and should receive traffic.

Path: `.port`<br />
Type: `integer`<br />
Required: `false`<br />
Default value: `8080`<br />

## preStopHookPath

A HTTP GET will be issued to this endpoint at least once before the pod is terminated. See https://doc.nais.io/nais-application/#handles-termination-gracefully.

Path: `.preStopHookPath`<br />
Type: `string`<br />
Required: `false`<br />

## prometheus

Prometheus is used to [scrape metrics from the pod](https://doc.nais.io/observability/metrics/).

Path: `.prometheus`<br />
Type: `object`<br />
Required: `false`<br />

### enabled

Path: `.prometheus.enabled`<br />
Type: `boolean`<br />
Required: `false`<br />
Example value: `true`<br />

### path

Path: `.prometheus.path`<br />
Type: `string`<br />
Required: `false`<br />
Default value: `/metrics`<br />

### port

Path: `.prometheus.port`<br />
Type: `string`<br />
Required: `false`<br />
Example value: `8080`<br />

## readiness

Sometimes, applications are temporarily unable to serve traffic. For example, an application might need to load large data or configuration files during startup, or depend on external services after startup. In such cases, you don't want to kill the application, but you don’t want to send it requests either. Kubernetes provides readiness probes to detect and mitigate these situations. A pod with containers reporting that they are not ready does not receive traffic through Kubernetes Services. Read more about this over at the [Kubernetes readiness documentation](https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/).

Path: `.readiness`<br />
Type: `object`<br />
Required: `false`<br />

### failureThreshold

When a Pod starts, and the probe fails, Kubernetes will try _failureThreshold_ times before giving up. Giving up in case of a startup probe means restarting the Pod.

Path: `.readiness.failureThreshold`<br />
Type: `integer`<br />
Required: `false`<br />
Example value: `10`<br />

### initialDelay

Number of seconds after the container has started before startup probes are initiated.

Path: `.readiness.initialDelay`<br />
Type: `integer`<br />
Required: `false`<br />
Example value: `20`<br />

### path

HTTP endpoint path that signals 200 OK if the application has started successfully.

Path: `.readiness.path`<br />
Type: `string`<br />
Required: `true`<br />
Example value: `/isalive`<br />

### periodSeconds

How often (in seconds) to perform the probe.

Path: `.readiness.periodSeconds`<br />
Type: `integer`<br />
Required: `false`<br />
Example value: `10`<br />

### port

Port for the startup probe.

Path: `.readiness.port`<br />
Type: `integer`<br />
Required: `false`<br />
Example value: `http`<br />

### timeout

Number of seconds after which the probe times out.

Path: `.readiness.timeout`<br />
Type: `integer`<br />
Required: `false`<br />
Example value: `1`<br />

## replicas

The numbers of pods to run in parallel.

Path: `.replicas`<br />
Type: `object`<br />
Required: `false`<br />

### cpuThresholdPercentage

Amount of CPU usage before the autoscaler kicks in.

Path: `.replicas.cpuThresholdPercentage`<br />
Type: `integer`<br />
Required: `false`<br />
Default value: `50`<br />

### max

The pod autoscaler will scale deployments on demand until this maximum has been reached.

Path: `.replicas.max`<br />
Type: `integer`<br />
Required: `false`<br />
Default value: `4`<br />

### min

The minimum amount of replicas acceptable for a successful deployment.

Path: `.replicas.min`<br />
Type: `integer`<br />
Required: `false`<br />
Default value: `2`<br />

## resources

When Containers have [resource requests](http://kubernetes.io/docs/user-guide/compute-resources/) specified, the Kubernetes scheduler can make better decisions about which nodes to place pods on.

Path: `.resources`<br />
Type: `object`<br />
Required: `false`<br />

### limits

Path: `.resources.limits`<br />
Type: `object`<br />
Required: `false`<br />

#### cpu

Path: `.resources.limits.cpu`<br />
Type: `string`<br />
Required: `false`<br />
Default value: `500m`<br />
Pattern: `^\d+m?$`<br />

#### memory

Path: `.resources.limits.memory`<br />
Type: `string`<br />
Required: `false`<br />
Default value: `512Mi`<br />
Pattern: `^\d+[KMG]i$`<br />

### requests

Path: `.resources.requests`<br />
Type: `object`<br />
Required: `false`<br />

#### cpu

Path: `.resources.requests.cpu`<br />
Type: `string`<br />
Required: `false`<br />
Default value: `200m`<br />
Pattern: `^\d+m?$`<br />

#### memory

Path: `.resources.requests.memory`<br />
Type: `string`<br />
Required: `false`<br />
Default value: `256Mi`<br />
Pattern: `^\d+[KMG]i$`<br />

## secureLogs

Whether or not to enable a sidecar container for secure logging.

Path: `.secureLogs`<br />
Type: `object`<br />
Required: `false`<br />

### enabled

Whether to enable a sidecar container for secure logging. If enabled, a volume is mounted in the pods where secure logs can be saved.

Path: `.secureLogs.enabled`<br />
Type: `boolean`<br />
Required: `true`<br />
Default value: `false`<br />

## service

How to connect to the default service in your application's container.

Path: `.service`<br />
Type: `object`<br />
Required: `false`<br />

### port

Port for the default service. Default port is 80.

Path: `.service.port`<br />
Type: `integer`<br />
Required: `true`<br />
Default value: `80`<br />

### protocol

Which protocol the backend service runs on. Default is http.

Path: `.service.protocol`<br />
Type: `enum`<br />
Required: `false`<br />
Default value: `http`<br />
Allowed values:<br />
  * `http`
  * `redis`
  * `tcp`
  * `grpc`

## skipCaBundle

Whether to skip injection of certificate authority bundle or not. Defaults to false.

Path: `.skipCaBundle`<br />
Type: `boolean`<br />
Required: `false`<br />

## startup

Startup probes will be available with Kubernetes 1.18 (in GCP, and 1.17 on-prem). Do not use this feature yet as it will not work. 
 Sometimes, you have to deal with legacy applications that might require an additional startup time on their first initialization. In such cases, it can be tricky to set up liveness probe parameters without compromising the fast response to deadlocks that motivated such a probe. The trick is to set up a startup probe with the same command, HTTP or TCP check, with a failureThreshold * periodSeconds long enough to cover the worst case startup time.

Path: `.startup`<br />
Type: `object`<br />
Required: `false`<br />

### failureThreshold

When a Pod starts, and the probe fails, Kubernetes will try _failureThreshold_ times before giving up. Giving up in case of a startup probe means restarting the Pod.

Path: `.startup.failureThreshold`<br />
Type: `integer`<br />
Required: `false`<br />
Example value: `10`<br />

### initialDelay

Number of seconds after the container has started before startup probes are initiated.

Path: `.startup.initialDelay`<br />
Type: `integer`<br />
Required: `false`<br />
Example value: `20`<br />

### path

HTTP endpoint path that signals 200 OK if the application has started successfully.

Path: `.startup.path`<br />
Type: `string`<br />
Required: `true`<br />
Example value: `/isalive`<br />

### periodSeconds

How often (in seconds) to perform the probe.

Path: `.startup.periodSeconds`<br />
Type: `integer`<br />
Required: `false`<br />
Example value: `10`<br />

### port

Port for the startup probe.

Path: `.startup.port`<br />
Type: `integer`<br />
Required: `false`<br />
Example value: `http`<br />

### timeout

Number of seconds after which the probe times out.

Path: `.startup.timeout`<br />
Type: `integer`<br />
Required: `false`<br />
Example value: `1`<br />

## strategy

Specifies the strategy used to replace old Pods by new ones.

Path: `.strategy`<br />
Type: `object`<br />
Required: `false`<br />

### type

Path: `.strategy.type`<br />
Type: `enum`<br />
Required: `true`<br />
Default value: `RollingUpdate`<br />
Allowed values:<br />
  * `Recreate`
  * `RollingUpdate`

## tokenx

OAuth2 tokens from TokenX for your application.

Path: `.tokenx`<br />
Type: `object`<br />
Required: `false`<br />

### enabled

if enabled, the application will have a jwker secret injected

Path: `.tokenx.enabled`<br />
Type: `boolean`<br />
Required: `true`<br />
Default value: `false`<br />

### mountSecretsAsFilesOnly

if enabled, secrets for TokenX will be mounted as files only, i.e. not as env.

Path: `.tokenx.mountSecretsAsFilesOnly`<br />
Type: `boolean`<br />
Required: `false`<br />

## tracing

Path: `.tracing`<br />
Type: `object`<br />
Required: `false`<br />

### enabled

if enabled, a rule allowing egress to app:jaeger will be appended to NetworkPolicy

Path: `.tracing.enabled`<br />
Type: `boolean`<br />
Required: `true`<br />

## vault

Provides secrets management, identity-based access, and encrypting application data for auditing of secrets for applications, systems, and users. See https://github.com/navikt/vault-iac/tree/master/doc.

Path: `.vault`<br />
Type: `object`<br />
Required: `false`<br />
Availability: on-premises<br />

### enabled

Path: `.vault.enabled`<br />
Type: `boolean`<br />
Required: `false`<br />
Example value: `true`<br />

### paths

Path: `.vault.paths[]`<br />
Type: `array`<br />
Required: `false`<br />

#### format

Path: `.vault.paths[].format`<br />
Type: `enum`<br />
Required: `false`<br />
Example value: `env`<br />
Allowed values:<br />
  * `flatten`
  * `json`
  * `yaml`
  * `env`
  * `properties`
  * _no value_

#### kvPath

Path: `.vault.paths[].kvPath`<br />
Type: `string`<br />
Required: `false`<br />
Example value: `/kv/preprod/fss/application/namespace`<br />

#### mountPath

Path: `.vault.paths[].mountPath`<br />
Type: `string`<br />
Required: `false`<br />
Example value: `/var/run/secrets/nais.io/vault`<br />

### sidecar

Path: `.vault.sidecar`<br />
Type: `boolean`<br />
Required: `false`<br />
Example value: `true`<br />

## webproxy

Expose web proxy configuration to the application using the `$HTTP_PROXY`, `$HTTPS_PROXY` and `$NO_PROXY` environment variables.

Path: `.webproxy`<br />
Type: `boolean`<br />
Required: `false`<br />
Availability: on-premises<br />

