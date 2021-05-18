## accessPolicy
By default, all traffic is disallowed between applications inside the cluster. Configure access policies to allow specific applications.

Type: `object`<br />
Required: `false`<br />
Availability: GCP<br />

### accessPolicy.inbound
Type: `object`<br />
Required: `false`<br />

#### accessPolicy.inbound.rules[]
Type: `array`<br />
Required: `true`<br />

##### accessPolicy.inbound.rules[].application
Type: `string`<br />
Required: `false`<br />

##### accessPolicy.inbound.rules[].cluster
Type: `string`<br />
Required: `false`<br />

##### accessPolicy.inbound.rules[].namespace
Type: `string`<br />
Required: `false`<br />

### accessPolicy.outbound
Type: `object`<br />
Required: `false`<br />

#### accessPolicy.outbound.external[]
Type: `array`<br />
Required: `false`<br />

##### accessPolicy.outbound.external[].host
Type: `string`<br />
Required: `false`<br />

##### accessPolicy.outbound.external[].ports[]
Type: `array`<br />
Required: `false`<br />

###### accessPolicy.outbound.external[].ports[].name
Type: `string`<br />
Required: `false`<br />

###### accessPolicy.outbound.external[].ports[].port
Type: `integer`<br />
Required: `false`<br />

###### accessPolicy.outbound.external[].ports[].protocol
Type: `enum`<br />
Required: `false`<br />
Allowed values: `GRPC`, `HTTP`, `HTTP2`, `HTTPS`, `MONGO`, `TCP`, `TLS`<br />

#### accessPolicy.outbound.rules[]
Type: `array`<br />
Required: `false`<br />

##### accessPolicy.outbound.rules[].application
Type: `string`<br />
Required: `false`<br />

##### accessPolicy.outbound.rules[].cluster
Type: `string`<br />
Required: `false`<br />

##### accessPolicy.outbound.rules[].namespace
Type: `string`<br />
Required: `false`<br />

## azure
Type: `object`<br />
Required: `false`<br />

### azure.application
Configures an Azure AD client for this application. See [Azure AD](https://doc.nais.io/security/auth/azure-ad/) for more details.

Type: `object`<br />
Required: `true`<br />

#### azure.application.claims
Claims defines additional configuration of the emitted claims in tokens returned to the AzureAdApplication

Type: `object`<br />
Required: `false`<br />

##### azure.application.claims.extra[]
Extra is a list of additional claims to be mapped from an associated claim-mapping policy.

Type: `array`<br />
Required: `false`<br />

##### azure.application.claims.groups[]
Groups is a list of Azure AD group IDs to be emitted in the 'Groups' claim.

Type: `array`<br />
Required: `false`<br />

###### azure.application.claims.groups[].id
Type: `string`<br />
Required: `false`<br />

#### azure.application.enabled
Type: `boolean`<br />
Required: `true`<br />
Default value: `false`<br />

#### azure.application.replyURLs[]
Type: `array`<br />
Required: `false`<br />

#### azure.application.tenant
Type: `enum`<br />
Required: `false`<br />
Allowed values: `nav.no`, `trygdeetaten.no`<br />

## elastic
Type: `object`<br />
Required: `false`<br />

### elastic.instance
Provisions an Elasticsearch instance and configures your application so it can access it. Use the `instance_name` that you specified in the [navikt/aiven-iac](https://github.com/navikt/aiven-iac) repository.

Type: `string`<br />
Required: `true`<br />
Availability: GCP<br />

## env[]
Custom environment variables injected into your container.

Type: `array`<br />
Required: `false`<br />

### env[].name
Type: `string`<br />
Required: `false`<br />
Example value: `MY_CUSTOM_VAR`<br />

### env[].value
Type: `string`<br />
Required: `false`<br />
Example value: `some_value`<br />

### env[].valueFrom
Type: `object`<br />
Required: `false`<br />

#### env[].valueFrom.fieldRef
Type: `object`<br />
Required: `true`<br />

##### env[].valueFrom.fieldRef.fieldPath
Type: `enum`<br />
Required: `true`<br />
Allowed values: _(empty string)_, `metadata.annotations`, `metadata.labels`, `metadata.name`, `metadata.namespace`, `spec.nodeName`, `spec.serviceAccountName`, `status.hostIP`, `status.podIP`<br />

## envFrom[]
Will expose all variables in ConfigMap or Secret resource as environment variables. One of `configmap` or `secret` is required.

Type: `array`<br />
Required: `false`<br />
Availability: team namespaces<br />

### envFrom[].configmap
Type: `string`<br />
Required: `false`<br />
Example value: `configmap-with-envs`<br />

### envFrom[].secret
Type: `string`<br />
Required: `false`<br />
Example value: `secret-with-envs`<br />

## filesFrom[]
List of ConfigMap or Secret resources that will have their contents mounted into the containers as files. Either `configmap` or `secret` is required.

Type: `array`<br />
Required: `false`<br />
Availability: team namespaces<br />

### filesFrom[].configmap
Type: `string`<br />
Required: `false`<br />
Example value: `example-files-configmap`<br />

### filesFrom[].mountPath
Type: `string`<br />
Required: `false`<br />
Example value: `/var/run/secrets`<br />

### filesFrom[].secret
Type: `string`<br />
Required: `false`<br />
Example value: `my-secret-file`<br />

## gcp
Type: `object`<br />
Required: `false`<br />
Availability: GCP<br />

### gcp.buckets[]
Provision cloud storage buckets and connect them to your application.

Type: `array`<br />
Required: `false`<br />

#### gcp.buckets[].cascadingDelete
Type: `boolean`<br />
Required: `false`<br />

#### gcp.buckets[].lifecycleCondition
Type: `object`<br />
Required: `false`<br />

##### gcp.buckets[].lifecycleCondition.age
Type: `integer`<br />
Required: `false`<br />

##### gcp.buckets[].lifecycleCondition.createdBefore
Type: `string`<br />
Required: `false`<br />

##### gcp.buckets[].lifecycleCondition.numNewerVersions
Type: `integer`<br />
Required: `false`<br />

##### gcp.buckets[].lifecycleCondition.withState
Type: `string`<br />
Required: `false`<br />

#### gcp.buckets[].name
Type: `string`<br />
Required: `false`<br />

#### gcp.buckets[].retentionPeriodDays
Type: `integer`<br />
Required: `false`<br />
Value range: `1`-`36500`<br />

### gcp.permissions[]
List of _additional_ permissions that should be granted to your application for accessing external GCP resources that have not been provisioned through NAIS. [Supported resources found here](https://cloud.google.com/config-connector/docs/reference/resource-docs/iam/iampolicymember#external_organization_level_policy_member).

Type: `array`<br />
Required: `false`<br />

#### gcp.permissions[].resource
Type: `object`<br />
Required: `false`<br />

##### gcp.permissions[].resource.apiVersion
Type: `string`<br />
Required: `true`<br />

##### gcp.permissions[].resource.kind
Type: `string`<br />
Required: `true`<br />

##### gcp.permissions[].resource.name
Type: `string`<br />
Required: `false`<br />

#### gcp.permissions[].role
Type: `string`<br />
Required: `false`<br />

### gcp.sqlInstances[]
Provision database instances and connect them to your application. See [PostgreSQL documentation](https://doc.nais.io/persistence/postgres/) for more details.

Type: `array`<br />
Required: `false`<br />

#### gcp.sqlInstances[].autoBackupHour
If specified, run automatic backups of the SQL database at the given hour. Note that this will backup the whole SQL instance, and not separate databases. Restores are done using the Google Cloud Console.

Type: `integer`<br />
Required: `false`<br />
Value range: `0`-`23`<br />

#### gcp.sqlInstances[].cascadingDelete
Type: `boolean`<br />
Required: `false`<br />

#### gcp.sqlInstances[].collation
Type: `string`<br />
Required: `false`<br />

#### gcp.sqlInstances[].databases[]
Type: `array`<br />
Required: `false`<br />

##### gcp.sqlInstances[].databases[].envVarPrefix
Type: `string`<br />
Required: `false`<br />

##### gcp.sqlInstances[].databases[].name
Type: `string`<br />
Required: `false`<br />

##### gcp.sqlInstances[].databases[].users[]
Type: `array`<br />
Required: `false`<br />

###### gcp.sqlInstances[].databases[].users[].name
Type: `string`<br />
Required: `false`<br />
Pattern: `^[_a-zA-Z][_a-zA-Z0-9]+$`<br />

#### gcp.sqlInstances[].diskAutoresize
Type: `boolean`<br />
Required: `false`<br />

#### gcp.sqlInstances[].diskSize
How much hard drive space to allocate for the SQL server, in gigabytes.

Type: `integer`<br />
Required: `false`<br />
Minimum value: `10`<br />

#### gcp.sqlInstances[].diskType
Type: `enum`<br />
Required: `false`<br />
Allowed values: `HDD`, `SSD`<br />

#### gcp.sqlInstances[].highAvailability
Type: `boolean`<br />
Required: `false`<br />

#### gcp.sqlInstances[].maintenance
Type: `object`<br />
Required: `false`<br />

##### gcp.sqlInstances[].maintenance.day
Type: `integer`<br />
Required: `false`<br />
Value range: `1`-`7`<br />

##### gcp.sqlInstances[].maintenance.hour
Type: `integer`<br />
Required: `false`<br />
Value range: `0`-`23`<br />

#### gcp.sqlInstances[].name
Type: `string`<br />
Required: `false`<br />

#### gcp.sqlInstances[].tier
Server tier, i.e. how much CPU and memory allocated. Available tiers can be retrieved on the command line by running `gcloud sql tiers list`.

Type: `string`<br />
Required: `false`<br />
Pattern: `db-.+`<br />

#### gcp.sqlInstances[].type
Type: `enum`<br />
Required: `false`<br />
Allowed values: `POSTGRES_11`, `POSTGRES_12`<br />

## idporten
Configures an ID-porten client for this application. See [ID-porten](https://doc.nais.io/security/auth/idporten/) for more details.

Type: `object`<br />
Required: `false`<br />

### idporten.accessTokenLifetime
Type: `integer`<br />
Required: `false`<br />
Value range: `1`-`3600`<br />

### idporten.clientURI
Type: `string`<br />
Required: `false`<br />

### idporten.enabled
Type: `boolean`<br />
Required: `true`<br />

### idporten.frontchannelLogoutPath
Type: `string`<br />
Required: `false`<br />
Pattern: `^\/.*$`<br />

### idporten.frontchannelLogoutURI
Type: `string`<br />
Required: `false`<br />

### idporten.postLogoutRedirectURIs[]
Type: `array`<br />
Required: `false`<br />

### idporten.redirectPath
Type: `string`<br />
Required: `false`<br />
Pattern: `^\/.*$`<br />

### idporten.redirectURI
Type: `string`<br />
Required: `false`<br />
Pattern: `^https:\/\/.+$`<br />

### idporten.sessionLifetime
Type: `integer`<br />
Required: `false`<br />
Value range: `3600`-`7200`<br />

## image
Your application's Docker image location and tag.

Type: `string`<br />
Required: `true`<br />
Example value: `ghcr.io/navikt/myapp:1.6.9`<br />

## ingresses[]
List of URLs that will route HTTPS traffic to the application. All URLs must start with `https://`. Domain availability differs according to which environment your application is running in.

Relevant information:

* [https://doc.nais.io/clusters/gcp/](https://doc.nais.io/clusters/gcp/)
* [https://doc.nais.io/clusters/on-premises/](https://doc.nais.io/clusters/on-premises/)

Type: `array`<br />
Required: `false`<br />

## kafka
Enable Aiven Kafka for your application.

Type: `object`<br />
Required: `false`<br />

### kafka.pool
Configures your application to access an Aiven Kafka cluster.

Relevant information:

* [https://doc.nais.io/addons/kafka/](https://doc.nais.io/addons/kafka/)

Type: `enum`<br />
Required: `true`<br />
Allowed values: `nav-dev`, `nav-infrastructure`, `nav-prod`<br />

## leaderElection
If true, an HTTP endpoint will be available at `$ELECTOR_PATH` that returns the current leader.

Relevant information:

* [https://doc.nais.io/addons/leader-election/](https://doc.nais.io/addons/leader-election/)

Type: `boolean`<br />
Required: `false`<br />

## liveness
Many applications running for long periods of time eventually transition to broken states, and cannot recover except by being restarted. Kubernetes provides liveness probes to detect and remedy such situations. Read more about this over at the [Kubernetes probes documentation](https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/).

Type: `object`<br />
Required: `false`<br />

### liveness.failureThreshold
When a Pod starts, and the probe fails, Kubernetes will try _failureThreshold_ times before giving up. Giving up in case of a startup probe means restarting the Pod.

Type: `integer`<br />
Required: `false`<br />
Default value: `3`<br />

### liveness.initialDelay
Number of seconds after the container has started before startup probes are initiated.

Type: `integer`<br />
Required: `false`<br />
Example value: `20`<br />

### liveness.path
HTTP endpoint path that signals 200 OK if the application has started successfully.

Type: `string`<br />
Required: `true`<br />
Example value: `/isalive`<br />

### liveness.periodSeconds
How often (in seconds) to perform the probe.

Type: `integer`<br />
Required: `false`<br />
Default value: `10`<br />

### liveness.port
Port for the startup probe.

Type: `integer`<br />
Required: `false`<br />
Example value: `http`<br />

### liveness.timeout
Number of seconds after which the probe times out.

Type: `integer`<br />
Required: `false`<br />
Default value: `1`<br />

## logformat
Format of the logs from the container. Use this if the container doesn't support JSON logging and the log is in a special format that need to be parsed.

Type: `enum`<br />
Required: `false`<br />
Allowed values: _(empty string)_, `accesslog`, `accesslog_with_processing_time`, `accesslog_with_referer_useragent`, `capnslog`, `glog`, `gokit`, `influxdb`, `log15`, `logrus`, `redis`, `simple`<br />

## logtransform
Extra filters for modifying log content. This can e.g. be used for setting loglevel based on http status code.

Type: `enum`<br />
Required: `false`<br />
Allowed values: `dns_loglevel`, `http_loglevel`<br />

## maskinporten
Configures a Maskinporten client for this application. See [Maskinporten](https://doc.nais.io/security/auth/maskinporten/) for more details.

Type: `object`<br />
Required: `false`<br />

### maskinporten.enabled
Type: `boolean`<br />
Required: `true`<br />

### maskinporten.scopes[]
Type: `array`<br />
Required: `false`<br />

#### maskinporten.scopes[].name
Type: `string`<br />
Required: `false`<br />

## port
The port number which is exposed by the container and should receive traffic.

Type: `integer`<br />
Required: `false`<br />
Default value: `8080`<br />

## preStopHookPath
A HTTP GET will be issued to this endpoint at least once before the pod is terminated.

Relevant information:

* [https://doc.nais.io/nais-application/#handles-termination-gracefully](https://doc.nais.io/nais-application/#handles-termination-gracefully)

Type: `string`<br />
Required: `false`<br />

## prometheus
Prometheus is used to [scrape metrics from the pod](https://doc.nais.io/observability/metrics/).

Type: `object`<br />
Required: `false`<br />

### prometheus.enabled
Type: `boolean`<br />
Required: `false`<br />
Example value: `true`<br />

### prometheus.path
Type: `string`<br />
Required: `false`<br />
Default value: `/metrics`<br />

### prometheus.port
Type: `string`<br />
Required: `false`<br />
Example value: `8080`<br />

## readiness
Sometimes, applications are temporarily unable to serve traffic. For example, an application might need to load large data or configuration files during startup, or depend on external services after startup. In such cases, you don't want to kill the application, but you don’t want to send it requests either. Kubernetes provides readiness probes to detect and mitigate these situations. A pod with containers reporting that they are not ready does not receive traffic through Kubernetes Services. Read more about this over at the [Kubernetes readiness documentation](https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/).

Type: `object`<br />
Required: `false`<br />

### readiness.failureThreshold
When a Pod starts, and the probe fails, Kubernetes will try _failureThreshold_ times before giving up. Giving up in case of a startup probe means restarting the Pod.

Type: `integer`<br />
Required: `false`<br />
Example value: `10`<br />

### readiness.initialDelay
Number of seconds after the container has started before startup probes are initiated.

Type: `integer`<br />
Required: `false`<br />
Example value: `20`<br />

### readiness.path
HTTP endpoint path that signals 200 OK if the application has started successfully.

Type: `string`<br />
Required: `true`<br />
Example value: `/isalive`<br />

### readiness.periodSeconds
How often (in seconds) to perform the probe.

Type: `integer`<br />
Required: `false`<br />
Example value: `10`<br />

### readiness.port
Port for the startup probe.

Type: `integer`<br />
Required: `false`<br />
Example value: `http`<br />

### readiness.timeout
Number of seconds after which the probe times out.

Type: `integer`<br />
Required: `false`<br />
Example value: `1`<br />

## replicas
The numbers of pods to run in parallel.

Type: `object`<br />
Required: `false`<br />

### replicas.cpuThresholdPercentage
Amount of CPU usage before the autoscaler kicks in.

Type: `integer`<br />
Required: `false`<br />
Default value: `50`<br />

### replicas.max
The pod autoscaler will scale deployments on demand until this maximum has been reached.

Type: `integer`<br />
Required: `false`<br />
Default value: `4`<br />

### replicas.min
The minimum amount of replicas acceptable for a successful deployment.

Type: `integer`<br />
Required: `false`<br />
Default value: `2`<br />

## resources
When Containers have [resource requests](http://kubernetes.io/docs/user-guide/compute-resources/) specified, the Kubernetes scheduler can make better decisions about which nodes to place pods on.

Type: `object`<br />
Required: `false`<br />

### resources.limits
Type: `object`<br />
Required: `false`<br />

#### resources.limits.cpu
Type: `string`<br />
Required: `false`<br />
Default value: `500m`<br />
Pattern: `^\d+m?$`<br />

#### resources.limits.memory
Type: `string`<br />
Required: `false`<br />
Default value: `512Mi`<br />
Pattern: `^\d+[KMG]i$`<br />

### resources.requests
Type: `object`<br />
Required: `false`<br />

#### resources.requests.cpu
Type: `string`<br />
Required: `false`<br />
Default value: `200m`<br />
Pattern: `^\d+m?$`<br />

#### resources.requests.memory
Type: `string`<br />
Required: `false`<br />
Default value: `256Mi`<br />
Pattern: `^\d+[KMG]i$`<br />

## secureLogs
Whether or not to enable a sidecar container for secure logging.

Type: `object`<br />
Required: `false`<br />

### secureLogs.enabled
Whether to enable a sidecar container for secure logging. If enabled, a volume is mounted in the pods where secure logs can be saved.

Type: `boolean`<br />
Required: `true`<br />
Default value: `false`<br />

## service
How to connect to the default service in your application's container.

Type: `object`<br />
Required: `false`<br />

### service.port
Port for the default service. Default port is 80.

Type: `integer`<br />
Required: `true`<br />
Default value: `80`<br />

### service.protocol
Which protocol the backend service runs on. Default is http.

Type: `enum`<br />
Required: `false`<br />
Default value: `http`<br />
Allowed values: `grpc`, `http`, `redis`, `tcp`<br />

## skipCaBundle
Whether to skip injection of certificate authority bundle or not. Defaults to false.

Type: `boolean`<br />
Required: `false`<br />

## startup
Startup probes will be available with Kubernetes 1.18 (in GCP, and 1.17 on-prem). Do not use this feature yet as it will not work. 
 Sometimes, you have to deal with legacy applications that might require an additional startup time on their first initialization. In such cases, it can be tricky to set up liveness probe parameters without compromising the fast response to deadlocks that motivated such a probe. The trick is to set up a startup probe with the same command, HTTP or TCP check, with a failureThreshold * periodSeconds long enough to cover the worst case startup time.

Type: `object`<br />
Required: `false`<br />

### startup.failureThreshold
When a Pod starts, and the probe fails, Kubernetes will try _failureThreshold_ times before giving up. Giving up in case of a startup probe means restarting the Pod.

Type: `integer`<br />
Required: `false`<br />
Example value: `10`<br />

### startup.initialDelay
Number of seconds after the container has started before startup probes are initiated.

Type: `integer`<br />
Required: `false`<br />
Example value: `20`<br />

### startup.path
HTTP endpoint path that signals 200 OK if the application has started successfully.

Type: `string`<br />
Required: `true`<br />
Example value: `/isalive`<br />

### startup.periodSeconds
How often (in seconds) to perform the probe.

Type: `integer`<br />
Required: `false`<br />
Example value: `10`<br />

### startup.port
Port for the startup probe.

Type: `integer`<br />
Required: `false`<br />
Example value: `http`<br />

### startup.timeout
Number of seconds after which the probe times out.

Type: `integer`<br />
Required: `false`<br />
Example value: `1`<br />

## strategy
Specifies the strategy used to replace old Pods by new ones.

Type: `object`<br />
Required: `false`<br />

### strategy.type
Type: `enum`<br />
Required: `true`<br />
Default value: `RollingUpdate`<br />
Allowed values: `Recreate`, `RollingUpdate`<br />

## tokenx
OAuth2 tokens from TokenX for your application.

Type: `object`<br />
Required: `false`<br />

### tokenx.enabled
if enabled, the application will have a jwker secret injected

Type: `boolean`<br />
Required: `true`<br />
Default value: `false`<br />

### tokenx.mountSecretsAsFilesOnly
if enabled, secrets for TokenX will be mounted as files only, i.e. not as env.

Type: `boolean`<br />
Required: `false`<br />

## tracing
Type: `object`<br />
Required: `false`<br />

### tracing.enabled
if enabled, a rule allowing egress to app:jaeger will be appended to NetworkPolicy

Type: `boolean`<br />
Required: `true`<br />

## vault
Provides secrets management, identity-based access, and encrypting application data for auditing of secrets for applications, systems, and users.

Relevant information:

* [https://github.com/navikt/vault-iac/tree/master/doc](https://github.com/navikt/vault-iac/tree/master/doc)

Type: `object`<br />
Required: `false`<br />
Availability: on-premises<br />

### vault.enabled
Type: `boolean`<br />
Required: `false`<br />
Example value: `true`<br />

### vault.paths[]
Type: `array`<br />
Required: `false`<br />

#### vault.paths[].format
Type: `enum`<br />
Required: `false`<br />
Example value: `env`<br />
Allowed values: _(empty string)_, `env`, `flatten`, `json`, `properties`, `yaml`<br />

#### vault.paths[].kvPath
Type: `string`<br />
Required: `false`<br />
Example value: `/kv/preprod/fss/application/namespace`<br />

#### vault.paths[].mountPath
Type: `string`<br />
Required: `false`<br />
Example value: `/var/run/secrets/nais.io/vault`<br />

### vault.sidecar
Type: `boolean`<br />
Required: `false`<br />
Example value: `true`<br />

## webproxy
Expose web proxy configuration to the application using the `$HTTP_PROXY`, `$HTTPS_PROXY` and `$NO_PROXY` environment variables.

Type: `boolean`<br />
Required: `false`<br />
Availability: on-premises<br />

