---
description: >
  Redis is an open source (BSD licensed) in-memory data structure store used as a database, cache and message broker.
---

# Redis

Redis on NAIS is run without disk/storage. This means that if a Redis instance is restarted due to something like
maintenance, the data will be lost. In other words, *do not* store data here that you cannot afford to lose.

It's also possible to password protect the Redis instance with some configuration.

## How to

Redis can be run as a normal NAIS application. This means that you can only run single instances that are not scalable;
increasing replicas will only start new databases that are not synced. Contact [@Kyrre.Havik.Eriksen] if you need High
Availability-Redis.

### Example deployments 

An example Redis setup looks like this:

{% code-tabs %}
{% code-tabs-item title="redis.yaml" %}

#### Vanilla Redis {#redis-vanilla}
```yaml
---
apiVersion: "nais.io/v1alpha1"
kind: "Application"
metadata:
  labels:
    team: ${teamname}
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
```
{% endcode-tabs-item %}

{% code-tabs-item title="redis-with-metrics.yaml" %}

#### Vanilla Redis with metrics {#redis-with-metrics}
```yaml
---
apiVersion: "nais.io/v1alpha1"
kind: "Application"
metadata:
  labels:
    team: ${teamname}
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
  env:
    - name: REDIS_ADDR
      value: ${appname}:6379
    - name: REDIS_EXPORTER_LOG_FORMAT
      value: json
```
{% endcode-tabs-item %}
{% code-tabs-item title="redis-secure.yaml" %}

#### Secured Redis with metrics {#redis-secure}
```yaml
---
apiVersion: "nais.io/v1alpha1"
kind: "Application"
metadata:
  labels:
    team: ${teamname}
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
  env:
    - name: REDIS_ADDR
      value: ${appname}:6379
    - name: REDIS_EXPORTER_LOG_FORMAT
      value: json
  envFrom:
    - secret: ${secret-name} 
```
{% endcode-tabs-item %}
{% endcode-tabs %}

Then, running `kubectl apply -f <redis-config>.yaml` will start up a Redis instance. Or deploy it with
[nais/deploy].

{% hint style="success" %}Check out [hub.docker.com] for latest Redis version{% endhint %}

For any applications that wishes to communicate with the Redis instance, it is recommended to add the following 
environment variable to the applications' `nais.yaml` files (or hard-code it, the value is not going to change):

```yaml
env:
  - name: REDIS_HOST
    value: ${appname}.${namespace}.svc.nais.local
```

#### Redis metrics

If you want metrics from a Redis instance running on NAIS, a separate exporter must also be run. An example
`nais.yaml` for the simplest version of such an exporter is found above. NAIS has also made a dashboard that everyone
can use. The only caveat is that the exporter application needs to end its name with `redisexporter` in the
configuration. The dashboard is called [Redis exporters]. The dashboard sorts by `addr`, enabling a single exporter
to scrape several Redis instances.

{% hint style="info" %}

See the [`redis-with-metrics.yaml`](#redis-with-metrics) example in [examples above](#example-deployments) for setting up a configuration with the metrics exporter.

{% endhint %}

{% hint style="success" %}Check out [github.com/oliver006] for latest Redis metrics exporter version{% endhint %}

## Secure Redis

If you need to password protect your Redis instance, the easiest way to do this is to use [Kubernetes secrets] and mount
them to your container, however you will also have to use a [different Redis baseimage from Bitnami][Bitnami Redis Dockerhub].

{% hint style="success" %}Check out [hub.docker.com][Bitnami Redis Dockerhub] for latest Bitnami Redis version{% endhint %}

Start by creating a Kubernetes secret:

```shell
kubectl create secret generic ${secret-name} \
    --from-literal=${key}=${value}
```

For example:

```shell
kubectl create secret generic redis-password \
    --from-literal=REDIS_PASSWORD=$(date +%s | sha256sum | base64 | head -c 32)
```

Now that you have a secret in Kubernetes (use `kubectl describe secret redis-password` to look at it), all you have to
do left is to mount it.

Then you should also mount it to any applications that connects to the Redis instance. This is done by adding the following to your `nais.yaml`.

```yaml
spec:
  envFrom:
    - secret: redis-password
```

{% hint style="info" %}

See the [`redis-secure.yaml`](#redis-secure) example in the [examples above](#example-deployments) for setting up Redis with a password from the secret you just created.

{% endhint %}

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

[NAIS manifest]: ../nais-application/reference.md
[Grafana]: https://grafana.adeo.no/d/Jmg7MydWz
[@Kyrre.Havik.Eriksen]: https://nav-it.slack.com/messages/D8QQ9ELK1
[Redis exporters]: https://grafana.adeo.no/d/L-Ktprrmz
[baseimages]: https://github.com/navikt/baseimages/tree/master/redis
[nais/deploy]: ../deployment
[hub.docker.com]: https://hub.docker.com/_/redis
[github.com/oliver006]: https://github.com/oliver006/redis_exporter/releases
[Kubernetes secrets]: ../security/secrets/kubernetes-secrets.md
[Bitnami Redis Dockerhub]: https://hub.docker.com/r/bitnami/redis/
