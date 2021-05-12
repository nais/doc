# Application

Application defines a NAIS application.

* JSONPath: ``
* Type: `object`
* Required: `false`

## apiVersion

APIVersion defines the versioned schema of this representation of an object. Servers should convert recognized schemas to the latest internal value, and may reject unrecognized values. More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#resources

* JSONPath: `.apiVersion`
* Type: `string`
* Required: `false`

## kind

Kind is a string value representing the REST resource this object represents. Servers may infer this from the endpoint the client submits requests to. Cannot be updated. In CamelCase. More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#types-kinds

* JSONPath: `.kind`
* Type: `string`
* Required: `false`

## spec

ApplicationSpec contains the NAIS manifest. Please keep this list sorted for clarity.

* JSONPath: `.spec`
* Type: `object`
* Required: `true`

### accessPolicy

By default, all traffic is disallowed between applications inside the cluster. Configure access policies to allow specific applications.

* JSONPath: `.spec.accessPolicy`
* Type: `object`
* Required: `false`
* Availability: GCP

#### inbound

* JSONPath: `.spec.accessPolicy.inbound`
* Type: `object`
* Required: `false`

##### rules

* JSONPath: `.spec.accessPolicy.inbound.rules[]`
* Type: `array`
* Required: `true`

###### application

* JSONPath: `.spec.accessPolicy.inbound.rules[].application`
* Type: `string`
* Required: `false`

###### cluster

* JSONPath: `.spec.accessPolicy.inbound.rules[].cluster`
* Type: `string`
* Required: `false`

###### namespace

* JSONPath: `.spec.accessPolicy.inbound.rules[].namespace`
* Type: `string`
* Required: `false`

#### outbound

* JSONPath: `.spec.accessPolicy.outbound`
* Type: `object`
* Required: `false`

##### external

* JSONPath: `.spec.accessPolicy.outbound.external[]`
* Type: `array`
* Required: `false`

###### host

* JSONPath: `.spec.accessPolicy.outbound.external[].host`
* Type: `string`
* Required: `false`

###### ports

* JSONPath: `.spec.accessPolicy.outbound.external[].ports[]`
* Type: `array`
* Required: `false`

####### name

* JSONPath: `.spec.accessPolicy.outbound.external[].ports[].name`
* Type: `string`
* Required: `false`

####### port

* JSONPath: `.spec.accessPolicy.outbound.external[].ports[].port`
* Type: `integer`
* Required: `false`

####### protocol

* JSONPath: `.spec.accessPolicy.outbound.external[].ports[].protocol`
* Type: `enum`
* Required: `false`
* Allowed values:
    * `HTTP`
    * `HTTPS`
    * `GRPC`
    * `HTTP2`
    * `MONGO`
    * `TCP`
    * `TLS`

##### rules

* JSONPath: `.spec.accessPolicy.outbound.rules[]`
* Type: `array`
* Required: `false`

###### application

* JSONPath: `.spec.accessPolicy.outbound.rules[].application`
* Type: `string`
* Required: `false`

###### cluster

* JSONPath: `.spec.accessPolicy.outbound.rules[].cluster`
* Type: `string`
* Required: `false`

###### namespace

* JSONPath: `.spec.accessPolicy.outbound.rules[].namespace`
* Type: `string`
* Required: `false`

### azure

* JSONPath: `.spec.azure`
* Type: `object`
* Required: `false`

#### application

Configures an Azure AD client for this application. See [Azure AD](https://doc.nais.io/security/auth/azure-ad/) for more details.

* JSONPath: `.spec.azure.application`
* Type: `object`
* Required: `true`

##### claims

Claims defines additional configuration of the emitted claims in tokens returned to the AzureAdApplication

* JSONPath: `.spec.azure.application.claims`
* Type: `object`
* Required: `false`

###### extra

Extra is a list of additional claims to be mapped from an associated claim-mapping policy.

* JSONPath: `.spec.azure.application.claims.extra[]`
* Type: `array`
* Required: `false`

###### groups

Groups is a list of Azure AD group IDs to be emitted in the 'Groups' claim.

* JSONPath: `.spec.azure.application.claims.groups[]`
* Type: `array`
* Required: `false`

####### id

* JSONPath: `.spec.azure.application.claims.groups[].id`
* Type: `string`
* Required: `false`

##### enabled

* JSONPath: `.spec.azure.application.enabled`
* Type: `boolean`
* Required: `true`

##### replyURLs

* JSONPath: `.spec.azure.application.replyURLs[]`
* Type: `array`
* Required: `false`

##### tenant

* JSONPath: `.spec.azure.application.tenant`
* Type: `enum`
* Required: `false`
* Allowed values:
    * `nav.no`
    * `trygdeetaten.no`

### elastic

* JSONPath: `.spec.elastic`
* Type: `object`
* Required: `false`

#### instance

Provisions an Elasticsearch instance and configures your application so it can access it. Use the `instance_name` that you specified in the [navikt/aiven-iac](https://github.com/navikt/aiven-iac) repository.

* JSONPath: `.spec.elastic.instance`
* Type: `string`
* Required: `true`
* Availability: GCP

### env

Custom environment variables injected into your container.

* JSONPath: `.spec.env[]`
* Type: `array`
* Required: `false`

#### name

* JSONPath: `.spec.env[].name`
* Type: `string`
* Required: `false`
* Example value: `MY_CUSTOM_VAR`

#### value

* JSONPath: `.spec.env[].value`
* Type: `string`
* Required: `false`
* Example value: `some_value`

#### valueFrom

* JSONPath: `.spec.env[].valueFrom`
* Type: `object`
* Required: `false`

##### fieldRef

* JSONPath: `.spec.env[].valueFrom.fieldRef`
* Type: `object`
* Required: `true`

###### fieldPath

* JSONPath: `.spec.env[].valueFrom.fieldRef.fieldPath`
* Type: `enum`
* Required: `true`
* Allowed values:
    * _no value_
    * `metadata.name`
    * `metadata.namespace`
    * `metadata.labels`
    * `metadata.annotations`
    * `spec.nodeName`
    * `spec.serviceAccountName`
    * `status.hostIP`
    * `status.podIP`

### envFrom

Will expose all variables in ConfigMap or Secret resource as environment variables. One of `configmap` or `secret` is required.

* JSONPath: `.spec.envFrom[]`
* Type: `array`
* Required: `false`
* Availability: team namespaces

#### configmap

* JSONPath: `.spec.envFrom[].configmap`
* Type: `string`
* Required: `false`
* Example value: `configmap-with-envs`

#### secret

* JSONPath: `.spec.envFrom[].secret`
* Type: `string`
* Required: `false`
* Example value: `secret-with-envs`

### filesFrom

List of ConfigMap or Secret resources that will have their contents mounted into the containers as files. Either `configmap` or `secret` is required.

* JSONPath: `.spec.filesFrom[]`
* Type: `array`
* Required: `false`
* Availability: team namespaces

#### configmap

* JSONPath: `.spec.filesFrom[].configmap`
* Type: `string`
* Required: `false`
* Example value: `example-files-configmap`

#### mountPath

* JSONPath: `.spec.filesFrom[].mountPath`
* Type: `string`
* Required: `false`
* Example value: `/var/run/secrets`

#### secret

* JSONPath: `.spec.filesFrom[].secret`
* Type: `string`
* Required: `false`
* Example value: `my-secret-file`

### gcp

* JSONPath: `.spec.gcp`
* Type: `object`
* Required: `false`
* Availability: GCP

#### buckets

Provision cloud storage buckets and connect them to your application.

* JSONPath: `.spec.gcp.buckets[]`
* Type: `array`
* Required: `false`

##### cascadingDelete

* JSONPath: `.spec.gcp.buckets[].cascadingDelete`
* Type: `boolean`
* Required: `false`

##### lifecycleCondition

* JSONPath: `.spec.gcp.buckets[].lifecycleCondition`
* Type: `object`
* Required: `false`

###### age

* JSONPath: `.spec.gcp.buckets[].lifecycleCondition.age`
* Type: `integer`
* Required: `false`

###### createdBefore

* JSONPath: `.spec.gcp.buckets[].lifecycleCondition.createdBefore`
* Type: `string`
* Required: `false`

###### numNewerVersions

* JSONPath: `.spec.gcp.buckets[].lifecycleCondition.numNewerVersions`
* Type: `integer`
* Required: `false`

###### withState

* JSONPath: `.spec.gcp.buckets[].lifecycleCondition.withState`
* Type: `string`
* Required: `false`

##### name

* JSONPath: `.spec.gcp.buckets[].name`
* Type: `string`
* Required: `false`

##### retentionPeriodDays

* JSONPath: `.spec.gcp.buckets[].retentionPeriodDays`
* Type: `integer`
* Required: `false`
* Minimum value: `1`
* Minimum value: `36500`

#### permissions

List of _additional_ permissions that should be granted to your application for accessing external GCP resources that have not been provisioned through NAIS. [Supported resources found here](https://cloud.google.com/config-connector/docs/reference/resource-docs/iam/iampolicymember#external_organization_level_policy_member).

* JSONPath: `.spec.gcp.permissions[]`
* Type: `array`
* Required: `false`

##### resource

* JSONPath: `.spec.gcp.permissions[].resource`
* Type: `object`
* Required: `false`

###### apiVersion

* JSONPath: `.spec.gcp.permissions[].resource.apiVersion`
* Type: `string`
* Required: `true`

###### kind

* JSONPath: `.spec.gcp.permissions[].resource.kind`
* Type: `string`
* Required: `true`

###### name

* JSONPath: `.spec.gcp.permissions[].resource.name`
* Type: `string`
* Required: `false`

##### role

* JSONPath: `.spec.gcp.permissions[].role`
* Type: `string`
* Required: `false`

#### sqlInstances

Provision database instances and connect them to your application. See [PostgreSQL documentation](https://doc.nais.io/persistence/postgres/) for more details.

* JSONPath: `.spec.gcp.sqlInstances[]`
* Type: `array`
* Required: `false`

##### autoBackupHour

* JSONPath: `.spec.gcp.sqlInstances[].autoBackupHour`
* Type: `integer`
* Required: `false`
* Minimum value: `0`
* Minimum value: `23`

##### cascadingDelete

* JSONPath: `.spec.gcp.sqlInstances[].cascadingDelete`
* Type: `boolean`
* Required: `false`

##### collation

* JSONPath: `.spec.gcp.sqlInstances[].collation`
* Type: `string`
* Required: `false`

##### databases

* JSONPath: `.spec.gcp.sqlInstances[].databases[]`
* Type: `array`
* Required: `false`

###### envVarPrefix

* JSONPath: `.spec.gcp.sqlInstances[].databases[].envVarPrefix`
* Type: `string`
* Required: `false`

###### name

* JSONPath: `.spec.gcp.sqlInstances[].databases[].name`
* Type: `string`
* Required: `false`

###### users

* JSONPath: `.spec.gcp.sqlInstances[].databases[].users[]`
* Type: `array`
* Required: `false`

####### name

* JSONPath: `.spec.gcp.sqlInstances[].databases[].users[].name`
* Type: `string`
* Required: `false`
* Pattern: `^[_a-zA-Z][_a-zA-Z0-9]+$`

##### diskAutoresize

* JSONPath: `.spec.gcp.sqlInstances[].diskAutoresize`
* Type: `boolean`
* Required: `false`

##### diskSize

* JSONPath: `.spec.gcp.sqlInstances[].diskSize`
* Type: `integer`
* Required: `false`
* Minimum value: `10`

##### diskType

* JSONPath: `.spec.gcp.sqlInstances[].diskType`
* Type: `enum`
* Required: `false`
* Allowed values:
    * `SSD`
    * `HDD`

##### highAvailability

* JSONPath: `.spec.gcp.sqlInstances[].highAvailability`
* Type: `boolean`
* Required: `false`

##### maintenance

* JSONPath: `.spec.gcp.sqlInstances[].maintenance`
* Type: `object`
* Required: `false`

###### day

* JSONPath: `.spec.gcp.sqlInstances[].maintenance.day`
* Type: `integer`
* Required: `false`
* Minimum value: `1`
* Minimum value: `7`

###### hour

* JSONPath: `.spec.gcp.sqlInstances[].maintenance.hour`
* Type: `integer`
* Required: `false`
* Minimum value: `0`
* Minimum value: `23`

##### name

* JSONPath: `.spec.gcp.sqlInstances[].name`
* Type: `string`
* Required: `false`

##### tier

* JSONPath: `.spec.gcp.sqlInstances[].tier`
* Type: `string`
* Required: `false`
* Pattern: `db-.+`

##### type

* JSONPath: `.spec.gcp.sqlInstances[].type`
* Type: `enum`
* Required: `false`
* Allowed values:
    * `POSTGRES_11`
    * `POSTGRES_12`

### idporten

Configures an ID-porten client for this application. See [ID-porten](https://doc.nais.io/security/auth/idporten/) for more details.

* JSONPath: `.spec.idporten`
* Type: `object`
* Required: `false`

#### accessTokenLifetime

* JSONPath: `.spec.idporten.accessTokenLifetime`
* Type: `integer`
* Required: `false`
* Minimum value: `1`
* Minimum value: `3600`

#### clientURI

* JSONPath: `.spec.idporten.clientURI`
* Type: `string`
* Required: `false`

#### enabled

* JSONPath: `.spec.idporten.enabled`
* Type: `boolean`
* Required: `true`

#### frontchannelLogoutPath

* JSONPath: `.spec.idporten.frontchannelLogoutPath`
* Type: `string`
* Required: `false`
* Pattern: `^\/.*$`

#### frontchannelLogoutURI

* JSONPath: `.spec.idporten.frontchannelLogoutURI`
* Type: `string`
* Required: `false`

#### postLogoutRedirectURIs

* JSONPath: `.spec.idporten.postLogoutRedirectURIs[]`
* Type: `array`
* Required: `false`

#### redirectPath

* JSONPath: `.spec.idporten.redirectPath`
* Type: `string`
* Required: `false`
* Pattern: `^\/.*$`

#### redirectURI

* JSONPath: `.spec.idporten.redirectURI`
* Type: `string`
* Required: `false`
* Pattern: `^https:\/\/.+$`

#### sessionLifetime

* JSONPath: `.spec.idporten.sessionLifetime`
* Type: `integer`
* Required: `false`
* Minimum value: `3600`
* Minimum value: `7200`

### image

Your application's Docker image location and tag.

* JSONPath: `.spec.image`
* Type: `string`
* Required: `true`
* Example value: `ghcr.io/navikt/myapp:1.6.9`

### ingresses

List of URLs that will route HTTPS traffic to the application. All URLs must start with `https://`. Domain availability differs according to which environment your application is running in, see https://doc.nais.io/clusters/gcp/ and https://doc.nais.io/clusters/on-premises/.

* JSONPath: `.spec.ingresses[]`
* Type: `array`
* Required: `false`

### kafka

Enable Aiven Kafka for your application.

* JSONPath: `.spec.kafka`
* Type: `object`
* Required: `false`

#### pool

Configures your application to access an Aiven Kafka cluster. See https://doc.nais.io/addons/kafka/.

* JSONPath: `.spec.kafka.pool`
* Type: `enum`
* Required: `true`
* Allowed values:
    * `nav-dev`
    * `nav-prod`
    * `nav-infrastructure`

### leaderElection

If true, a HTTP endpoint will be available at `$ELECTOR_PATH` that returns the current leader. See https://doc.nais.io/addons/leader-election/.

* JSONPath: `.spec.leaderElection`
* Type: `boolean`
* Required: `false`

### liveness

Many applications running for long periods of time eventually transition to broken states, and cannot recover except by being restarted. Kubernetes provides liveness probes to detect and remedy such situations. Read more about this over at the [Kubernetes probes documentation](https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/).

* JSONPath: `.spec.liveness`
* Type: `object`
* Required: `false`

#### failureThreshold

When a Pod starts and the probe fails, Kubernetes will try _failureThreshold_ times before giving up. Giving up in case of a startup probe means restarting the Pod.

* JSONPath: `.spec.liveness.failureThreshold`
* Type: `integer`
* Required: `false`
* Default value: `3`

#### initialDelay

Number of seconds after the container has started before startup probes are initiated.

* JSONPath: `.spec.liveness.initialDelay`
* Type: `integer`
* Required: `false`
* Example value: `20`

#### path

HTTP endpoint path that signals 200 OK if the application has started successfully.

* JSONPath: `.spec.liveness.path`
* Type: `string`
* Required: `true`
* Example value: `/isalive`

#### periodSeconds

How often (in seconds) to perform the probe.

* JSONPath: `.spec.liveness.periodSeconds`
* Type: `integer`
* Required: `false`
* Default value: `10`

#### port

Port for the startup probe.

* JSONPath: `.spec.liveness.port`
* Type: `integer`
* Required: `false`
* Example value: `http`

#### timeout

Number of seconds after which the probe times out.

* JSONPath: `.spec.liveness.timeout`
* Type: `integer`
* Required: `false`
* Default value: `1`

### logformat

Format of the logs from the container. Use this if the container doesn't support JSON logging and the log is in a special format that need to be parsed.

* JSONPath: `.spec.logformat`
* Type: `enum`
* Required: `false`
* Allowed values:
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

### logtransform

Extra filters for modifying log content. This can e.g. be used for setting loglevel based on http status code.

* JSONPath: `.spec.logtransform`
* Type: `enum`
* Required: `false`
* Allowed values:
    * `http_loglevel`
    * `dns_loglevel`

### maskinporten

Configures a Maskinporten client for this application. See [Maskinporten](https://doc.nais.io/security/auth/maskinporten/) for more details.

* JSONPath: `.spec.maskinporten`
* Type: `object`
* Required: `false`

#### enabled

* JSONPath: `.spec.maskinporten.enabled`
* Type: `boolean`
* Required: `true`

#### scopes

* JSONPath: `.spec.maskinporten.scopes[]`
* Type: `array`
* Required: `false`

##### name

* JSONPath: `.spec.maskinporten.scopes[].name`
* Type: `string`
* Required: `false`

### port

The port number which is exposed by the container and should receive traffic.

* JSONPath: `.spec.port`
* Type: `integer`
* Required: `false`
* Default value: `8080`

### preStopHookPath

A HTTP GET will be issued to this endpoint at least once before the pod is terminated. See https://doc.nais.io/nais-application/#handles-termination-gracefully.

* JSONPath: `.spec.preStopHookPath`
* Type: `string`
* Required: `false`

### prometheus

Prometheus is used to [scrape metrics from the pod](https://doc.nais.io/observability/metrics/).

* JSONPath: `.spec.prometheus`
* Type: `object`
* Required: `false`

#### enabled

* JSONPath: `.spec.prometheus.enabled`
* Type: `boolean`
* Required: `false`
* Example value: `true`

#### path

* JSONPath: `.spec.prometheus.path`
* Type: `string`
* Required: `false`
* Default value: `/metrics`

#### port

* JSONPath: `.spec.prometheus.port`
* Type: `string`
* Required: `false`
* Example value: `8080`

### readiness

Sometimes, applications are temporarily unable to serve traffic. For example, an application might need to load large data or configuration files during startup, or depend on external services after startup. In such cases, you don't want to kill the application, but you don’t want to send it requests either. Kubernetes provides readiness probes to detect and mitigate these situations. A pod with containers reporting that they are not ready does not receive traffic through Kubernetes Services. Read more about this over at the [Kubernetes readiness documentation](https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/).

* JSONPath: `.spec.readiness`
* Type: `object`
* Required: `false`

#### failureThreshold

When a Pod starts and the probe fails, Kubernetes will try _failureThreshold_ times before giving up. Giving up in case of a startup probe means restarting the Pod.

* JSONPath: `.spec.readiness.failureThreshold`
* Type: `integer`
* Required: `false`
* Example value: `10`

#### initialDelay

Number of seconds after the container has started before startup probes are initiated.

* JSONPath: `.spec.readiness.initialDelay`
* Type: `integer`
* Required: `false`
* Example value: `20`

#### path

HTTP endpoint path that signals 200 OK if the application has started successfully.

* JSONPath: `.spec.readiness.path`
* Type: `string`
* Required: `true`
* Example value: `/isalive`

#### periodSeconds

How often (in seconds) to perform the probe.

* JSONPath: `.spec.readiness.periodSeconds`
* Type: `integer`
* Required: `false`
* Example value: `10`

#### port

Port for the startup probe.

* JSONPath: `.spec.readiness.port`
* Type: `integer`
* Required: `false`
* Example value: `http`

#### timeout

Number of seconds after which the probe times out.

* JSONPath: `.spec.readiness.timeout`
* Type: `integer`
* Required: `false`
* Example value: `1`

### replicas

The numbers of pods to run in parallel.

* JSONPath: `.spec.replicas`
* Type: `object`
* Required: `false`

#### cpuThresholdPercentage

Amount of CPU usage before the autoscaler kicks in.

* JSONPath: `.spec.replicas.cpuThresholdPercentage`
* Type: `integer`
* Required: `false`
* Default value: `50`

#### max

The pod autoscaler will scale deployments on demand until this maximum has been reached.

* JSONPath: `.spec.replicas.max`
* Type: `integer`
* Required: `false`
* Default value: `4`

#### min

The minimum amount of replicas acceptable for a successful deployment.

* JSONPath: `.spec.replicas.min`
* Type: `integer`
* Required: `false`
* Default value: `2`

### resources

When Containers have [resource requests](http://kubernetes.io/docs/user-guide/compute-resources/) specified, the Kubernetes scheduler can make better decisions about which nodes to place pods on.

* JSONPath: `.spec.resources`
* Type: `object`
* Required: `false`

#### limits

* JSONPath: `.spec.resources.limits`
* Type: `object`
* Required: `false`

##### cpu

* JSONPath: `.spec.resources.limits.cpu`
* Type: `string`
* Required: `false`
* Default value: `500m`
* Pattern: `^\d+m?$`

##### memory

* JSONPath: `.spec.resources.limits.memory`
* Type: `string`
* Required: `false`
* Default value: `512Mi`
* Pattern: `^\d+[KMG]i$`

#### requests

* JSONPath: `.spec.resources.requests`
* Type: `object`
* Required: `false`

##### cpu

* JSONPath: `.spec.resources.requests.cpu`
* Type: `string`
* Required: `false`
* Default value: `200m`
* Pattern: `^\d+m?$`

##### memory

* JSONPath: `.spec.resources.requests.memory`
* Type: `string`
* Required: `false`
* Default value: `256Mi`
* Pattern: `^\d+[KMG]i$`

### secureLogs

Whether or not to enable a sidecar container for secure logging.

* JSONPath: `.spec.secureLogs`
* Type: `object`
* Required: `false`

#### enabled

Whether to enable a sidecar container for secure logging. If enabled, a volume is mounted in the pods where secure logs can be saved.

* JSONPath: `.spec.secureLogs.enabled`
* Type: `boolean`
* Required: `true`

### service

How to connect to the default service in your application's container.

* JSONPath: `.spec.service`
* Type: `object`
* Required: `false`

#### port

Port for the default service. Default port is 80.

* JSONPath: `.spec.service.port`
* Type: `integer`
* Required: `true`

#### protocol

Which protocol the backend service runs on. Default is http.

* JSONPath: `.spec.service.protocol`
* Type: `enum`
* Required: `false`
* Allowed values:
    * `http`
    * `redis`
    * `tcp`
    * `grpc`

### skipCaBundle

Whether to skip injection of certificate authority bundle or not. Defaults to false.

* JSONPath: `.spec.skipCaBundle`
* Type: `boolean`
* Required: `false`

### startup

Startup probes will be available with Kubernetes 1.18 (in GCP, and 1.17 on-prem). Do not use this feature yet as it will not work. 
 Sometimes, you have to deal with legacy applications that might require an additional startup time on their first initialization. In such cases, it can be tricky to set up liveness probe parameters without compromising the fast response to deadlocks that motivated such a probe. The trick is to set up a startup probe with the same command, HTTP or TCP check, with a failureThreshold * periodSeconds long enough to cover the worst case startup time.

* JSONPath: `.spec.startup`
* Type: `object`
* Required: `false`

#### failureThreshold

When a Pod starts and the probe fails, Kubernetes will try _failureThreshold_ times before giving up. Giving up in case of a startup probe means restarting the Pod.

* JSONPath: `.spec.startup.failureThreshold`
* Type: `integer`
* Required: `false`
* Example value: `10`

#### initialDelay

Number of seconds after the container has started before startup probes are initiated.

* JSONPath: `.spec.startup.initialDelay`
* Type: `integer`
* Required: `false`
* Example value: `20`

#### path

HTTP endpoint path that signals 200 OK if the application has started successfully.

* JSONPath: `.spec.startup.path`
* Type: `string`
* Required: `true`
* Example value: `/isalive`

#### periodSeconds

How often (in seconds) to perform the probe.

* JSONPath: `.spec.startup.periodSeconds`
* Type: `integer`
* Required: `false`
* Example value: `10`

#### port

Port for the startup probe.

* JSONPath: `.spec.startup.port`
* Type: `integer`
* Required: `false`
* Example value: `http`

#### timeout

Number of seconds after which the probe times out.

* JSONPath: `.spec.startup.timeout`
* Type: `integer`
* Required: `false`
* Example value: `1`

### strategy

Specifies the strategy used to replace old Pods by new ones.

* JSONPath: `.spec.strategy`
* Type: `object`
* Required: `false`

#### type

* JSONPath: `.spec.strategy.type`
* Type: `enum`
* Required: `true`
* Default value: `RollingUpdate`
* Allowed values:
    * `Recreate`
    * `RollingUpdate`

### tokenx

OAuth2 tokens from TokenX for your application.

* JSONPath: `.spec.tokenx`
* Type: `object`
* Required: `false`

#### enabled

if enabled, the application will have a jwker secret injected

* JSONPath: `.spec.tokenx.enabled`
* Type: `boolean`
* Required: `true`

#### mountSecretsAsFilesOnly

if enabled, secrets for TokenX will be mounted as files only, i.e. not as env.

* JSONPath: `.spec.tokenx.mountSecretsAsFilesOnly`
* Type: `boolean`
* Required: `false`

### tracing

* JSONPath: `.spec.tracing`
* Type: `object`
* Required: `false`

#### enabled

if enabled, a rule allowing egress to app:jaeger will be appended to NetworkPolicy

* JSONPath: `.spec.tracing.enabled`
* Type: `boolean`
* Required: `true`

### vault

Provides secrets management, identity-based access, and encrypting application data for auditing of secrets for applications, systems, and users. See https://github.com/navikt/vault-iac/tree/master/doc.

* JSONPath: `.spec.vault`
* Type: `object`
* Required: `false`
* Availability: on-premises

#### enabled

* JSONPath: `.spec.vault.enabled`
* Type: `boolean`
* Required: `false`
* Example value: `true`

#### paths

* JSONPath: `.spec.vault.paths[]`
* Type: `array`
* Required: `false`

##### format

* JSONPath: `.spec.vault.paths[].format`
* Type: `enum`
* Required: `false`
* Example value: `env`
* Allowed values:
    * `flatten`
    * `json`
    * `yaml`
    * `env`
    * `properties`
    * _no value_

##### kvPath

* JSONPath: `.spec.vault.paths[].kvPath`
* Type: `string`
* Required: `false`
* Example value: `/kv/preprod/fss/application/namespace`

##### mountPath

* JSONPath: `.spec.vault.paths[].mountPath`
* Type: `string`
* Required: `false`
* Example value: `/var/run/secrets/nais.io/vault`

#### sidecar

* JSONPath: `.spec.vault.sidecar`
* Type: `boolean`
* Required: `false`
* Example value: `true`

### webproxy

Expose web proxy configuration to the application using the `$HTTP_PROXY`, `$HTTPS_PROXY` and `$NO_PROXY` environment variables.

* JSONPath: `.spec.webproxy`
* Type: `boolean`
* Required: `false`
* Availability: on-premises

