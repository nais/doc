---
description: >-
  Redis is an open source (BSD licensed) in-memory data structure store used as
  a database, cache and message broker.
---

# Redis

!!! warning "Availability"
    Using Aiven Redis is only available in GCP clusters.

!!! info "Legacy documentation"
    The documentation for the old way of running Redis can be found at the bottom of the [page](#legacy-redis-documentation).

Redis is available as an add-on to your Application or Naisjob.
Applications/Naisjobs owned by a team may share a Redis instance, and an Application/Naisjob may use multiple Redis instances at the same time.
In the rest of this documentation, we use Application, but everything holds true for Naisjob as well.

It is not possible to share Redis instances between teams.

In order to use Redis in your application, you add a [`redis` section](https://doc.nais.io/nais-application/application/#redis) to your `Application` resource (often called `nais.yaml`):

```yaml
spec:
  redis:
    - instance: sessions
      access: readwrite
    - instance: lookup
      access: read
```

The above snippet will allow your application to use the `sessions` Redis instance, and provide the application with credentials for a read/write user.
In addition, the application will get credentials for a read-only user for the `lookup` instance.
See the reference for other options for `access`.

If all you need is a Redis instance for one application using just the default settings, this is all you need.
If you want to share a Redis instance across applications, or want to change configuration away from the defaults, read the next section.

For each instance added to this list, your application will receive three environment variables.
The environment variables use a fixed prefix, and the instance name uppercased as a suffix.

Example for the sessions instance used above:

| Key                     | Value                                                                                                                                        |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| REDIS_URI_SESSIONS      | The URI for the Redis instance, typically with a `rediss` scheme. <br/>Example:  `rediss://redis-team-sessions-nav-dev.aivencloud.com:26483` |
| REDIS_USERNAME_SESSIONS | The username to use when connecting.                                                                                                         |
| REDIS_PASSWORD_SESSIONS | The password to use when connecting.                                                                                                         |

So far we have used `sessions` as the instance name, but you can name your redis instance what you want with some restrictions.

When you refer to redis in your `Application`, nais will look for a redis instance with the given name, or attempt to create one with default settings if it doesn't exist.

## Creating a Redis instance explicitly

We recommend creating your Redis instances in their own workflow for more control over configuration, especially if you intend for multiple applications using the same Redis instance, or if you need to change configuration.

Creating a Redis instance is done by adding a Redis resource to your namespace with detailed configuration.
Some configuration is enforced by the nais platform, while the rest is up to the users.

Earlier we talked about the "instance name".
In reality, the actual name of the redis instance will be `redis-<team name>-<instance name>` (where `team name` is the same as the namespace your application resides in).
The resource needs to have this full name in order to be accepted.

The default Redis created by nais looks like this:

```yaml
apiVersion: aiven.io/v1alpha1
kind: Redis
metadata:
  labels:
    app: redis-tester
    team: myteam
  name: redis-myteam-sessions
  namespace: myteam
spec:
  plan: startup-4
  project: nav-dev
```

A minimal Redis resource only requires `plan` and `project`.

 * `project` should match your nais tenant (`nav`, `mtpilot`, `ssb` or `fhi`) and the environment you are running in (ex. `dev`, `prod`), with a dash (`-`) in between.
 * `plan` is the Aiven plan for your Redis instance.
   See Aivens list of [possible plan values](https://aiven.io/pricing?product=redis).
   The values are lowercased.
   Make sure you understand the differences between the plans before selecting the one you need.
   Examples: `startup-4`, `startup-56`, `business-4`, `premium-14`.

We use Aivens operator, so the Redis resource is [documented in detail](https://aiven.github.io/aiven-operator/api-reference/redis.html) in the Aiven documentation.
You should look at the reference for any other fields that might be of interest.

Probably the most important value to consider is which plan to use.

The Startup plans are good for things like sessions or cache usage, where High Availability in case of failures is not important.
Upgrades and regular maintenance is handled without noticeable downtime, by adding a new upgraded node and replicating data over to it before switching over DNS and shutting down the old node.
Startup plans are backed up every 12 hours, keeping 1 backup available.

If you require HA, the Business plans provide for one failover node that takes over should your primary instance fail for any reason.
When using business plans, a second node is always available with continuous replication, so it is able to start serving data immediately should the primary node fail.
Business plans are backed up every 12 hours, keeping 3 days of backups available.

Once the resource is added to the cluster, some additional fields are filled in by the platform and should be left alone unless you have a good reason:

| field                   |                                                                                                       |
| ----------------------- | ----------------------------------------------------------------------------------------------------- |
| `projectVpcId`          | Ensures the instance is connected to the correct project VPC and is not available on public internet. |
| `tags`                  | Adds tags to the instance used for tracking billing in Aiven.                                         |
| `cloudName`             | Where the Redis instance should run.                                                                  |
| `terminationProtection` | Protects the instance against unintended termination. Must be set to `false` before deletion.         |

There are some fields available that should not be used:

| field                  |                                                                                                 |
| ---------------------- | ----------------------------------------------------------------------------------------------- |
| `authSecretRef`        | Reference to a secret containing an Aiven API token. Provided via other mechanisms.             |
| `connInfoSecretTarget` | Name of secret to put connection info in, not used as nais provides these via other mechanisms. |
| `projectVPCRef`        | Not used since we use `projectVpcId`.                                                           |
| `serviceIntegrations`  | Not used at this time.                                                                          |

# Legacy Redis documentation

This is the documentation for how you could run Redis on NAIS yourself, kept here for reference for those teams that continue to run Redis this way.
New installations of Redis should use Aiven Redis documented above.

Redis on NAIS is run without disk/storage. This means that if a Redis instance is restarted due to something like maintenance, the data will be lost. In other words, _do not_ store data here that you cannot afford to lose.

It's also possible to password protect the Redis instance with some configuration.

## How to

Redis can be run as a normal NAIS application. This means that you can only run single instances that are not scalable; increasing replicas will only start new databases that are not synced.

### Example deployments

An example Redis setup looks like this:

=== "Vanilla Redis"
    ```yaml
    ---
    apiVersion: "nais.io/v1alpha1"
    kind: "Application"
    metadata:
      labels:
        team: ${teamname}
      annotations:
        nais.io/read-only-file-system: "false"
        nais.io/run-as-user: "999"
      name: ${appname}
      namespace: ${teamname}
    spec:
      image: redis:<latest-docker-tag> # or a custom Redis-image
      port: 6379
      replicas: # A single Redis-app doesn't scale
        min: 1
        max: 1 # More replicas doesn't sync
      resources: # you need to monitor the resource usage yourself
        limits:
          cpu: 100m
          memory: 128Mi
        requests:
          cpu: 100m
          memory: 128Mi
      service:
        port: 6379
        protocol: redis
      accessPolicy: # for GCP
        inbound:
          rules:
            - application: ${inbound-app}
    ```
=== "Vanilla Redis with metrics"
    ```yaml
    ---
    apiVersion: "nais.io/v1alpha1"
    kind: "Application"
    metadata:
      labels:
        team: ${teamname}
      annotations:
        nais.io/read-only-file-system: "false"
        nais.io/run-as-user: "999"
      name: ${appname}
      namespace: ${teamname}
    spec:
      image: redis:<latest-docker-tag> # or a custom Redis-image
      port: 6379
      replicas: # A single Redis-app doesn't scale
        min: 1
        max: 1 # More replicas doesn't sync
      resources: # you need to monitor the resource usage yourself
        limits:
          cpu: 100m
          memory: 128Mi
        requests:
          cpu: 100m
          memory: 128Mi
      service:
        port: 6379
        protocol: redis
      accessPolicy: # for GCP
        inbound:
          rules:
            - application: ${appname}-redisexporter
    ---
    apiVersion: "nais.io/v1alpha1"
    kind: "Application"
    metadata:
      labels:
        team: ${teamname}
      name: ${appname}-redisexporter
      namespace: ${teamname}
    spec:
      image: oliver006/redis_exporter:<latest-docker>
      port: 9121
      prometheus:
        enabled: true
      replicas:
        min: 1
        max: 1
      resources:
        limits:
          cpu: 100m
          memory: 100Mi
        requests:
          cpu: 100m
          memory: 100Mi
      liveness:
        path: /health
      accessPolicy: # for GCP
        outbound:
          rules:
            - application: ${appname}
      env:
        - name: REDIS_ADDR
          value: ${appname}:6379
        - name: REDIS_EXPORTER_LOG_FORMAT
          value: json
    ```
=== "Secured Redis with metrics"
    ```yaml
    ---
    apiVersion: "nais.io/v1alpha1"
    kind: "Application"
    metadata:
      labels:
        team: ${teamname}
      annotations:
        "nais.io/run-as-group": "0"
        "nais.io/read-only-file-system": "false"
      name: ${appname}
      namespace: ${teamname}
    spec:
      image: bitnami/redis:<latest-docker-tag> # or a custom Redis-image
      port: 6379
      replicas: # A single Redis-app doesn't scale
        min: 1
        max: 1 # More replicas doesn't sync
      resources: # you need to monitor the resource usage yourself
        limits:
          cpu: 100m
          memory: 128Mi
        requests:
          cpu: 100m
          memory: 128Mi
      service:
        port: 6379
        protocol: redis
      accessPolicy: # for GCP
        inbound:
          rules:
            - application: ${appname}-redisexporter
      envFrom:
        - secret: ${secret-name}
    ---
    apiVersion: "nais.io/v1alpha1"
    kind: "Application"
    metadata:
      labels:
        team: ${teamname}
      name: ${appname}-redisexporter
      namespace: ${teamname}
    spec:
      image: oliver006/redis_exporter:<latest-docker>
      port: 9121
      prometheus:
        enabled: true
      replicas:
        min: 1
        max: 1
      resources:
        limits:
          cpu: 100m
          memory: 100Mi
        requests:
          cpu: 100m
          memory: 100Mi
      liveness:
        path: /health
      accessPolicy: # for GCP
        outbound:
          rules:
            - application: ${appname}
      env:
        - name: REDIS_ADDR
          value: ${appname}:6379
        - name: REDIS_EXPORTER_LOG_FORMAT
          value: json
      envFrom:
        - secret: ${secret-name}
    ```

Then, running `kubectl apply -f <redis-config>.yaml` will start up a Redis instance. Or deploy it with [nais/deploy](../deployment/README.md).

!!! success
    Check out [hub.docker.com](https://hub.docker.com/_/redis) for latest Redis version

For any applications that wishes to communicate with the Redis instance, it is recommended to add the following environment variable to the applications' `nais.yaml` files:

```yaml
env:
  - name: REDIS_HOST
    value: ${appname}.${namespace}.svc.nais.local
```

### GCP

If on [GCP](../clusters/gcp.md), the host name is slightly different:

```yaml
env:
  - name: REDIS_HOST
    value: ${appname}.${namespace}.svc.cluster.local
```

Remember to set up [access policies](../nais-application/access-policy.md) for your Redis instance as well:

```yaml
accessPolicy:
  inbound:
    rules:
      - application: ${inbound-appname}
```

And the equivalent outbound policy for any apps that should be able to connect to the redis instance:

```yaml
accessPolicy:
  outbound:
    rules:
      - application: ${redis-appname}
```

#### Redis metrics

If you want metrics from a Redis instance running on NAIS, a separate exporter must also be run. An example `nais.yaml` for the simplest version of such an exporter is found above. NAIS has also made a dashboard that everyone can use. The only caveat is that the exporter application needs to end its name with `redisexporter` in the configuration. The dashboard is called [Redis exporters](https://grafana.adeo.no/d/L-Ktprrmz). The dashboard sorts by `addr`, enabling a single exporter to scrape several Redis instances.

!!! info
    See the [`redis-with-metrics.yaml`](redis.md#redis-with-metrics) example in [examples above](redis.md#example-deployments) for setting up a configuration with the metrics exporter.

!!! success
    Check out [hub.docker.com](https://hub.docker.com/r/oliver006/redis_exporter/tags) for latest Redis metrics exporter version

## Secure Redis

If you need to password protect your Redis instance, the easiest way to do this is to use [Kubernetes secrets](../security/secrets/kubernetes-secrets.md) and mount them to your container, however you will also have to use a [different Redis baseimage from Bitnami](https://hub.docker.com/r/bitnami/redis/).

!!! success
    Check out [hub.docker.com](https://hub.docker.com/r/bitnami/redis/) for latest Bitnami Redis version

Start by creating a Kubernetes secret:

```text
kubectl create secret generic ${secret-name} \
    --from-literal=${key}=${value}
```

For example:

```text
kubectl create secret generic redis-password \
    --from-literal=REDIS_PASSWORD=$(cat /dev/urandom | env LC_ALL=C tr -dc 'a-zA-Z0-9' | fold -w 32 | head -n 1)
```

Now that you have a secret in Kubernetes \(use `kubectl describe secret redis-password` to look at it\), all you have to do left is to mount it.

Then you should also mount it to any applications that connects to the Redis instance. This is done by adding the following to your `nais.yaml`.

```yaml
spec:
  envFrom:
    - secret: redis-password
```

!!! info
    See the [`redis-secure.yaml`](redis.md#redis-secure) example in the [examples above](redis.md#example-deployments) for setting up Redis with a password from the secret you just created.

## Code examples

We are not application developers, so please help us out by expanding with examples!

### Redis cache in Spring Boot

Add the following to the Spring Boot application's `application.yaml` to enable Spring to use Redis as cache.

```yaml
session:
  store-type: redis
redis:
  host: ${REDIS_HOST}
  port: 6379
```
