---
description: >-
  Redis is an open source (BSD licensed) in-memory data structure store used as
  a database, cache and message broker.
---

# Redis

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
