---
description: >
  Redis is an open source (BSD licensed) in-memory data structure store used as a database, cache and message broker.
---

# Redis

Redis on NAIS is run without disk/storage. This means that if a Redis instance is restarted due to something like
maintenance, the data will be lost. In other words, *do not* store data here that you cannot afford to lose.

It's also possible to password protect the Redis instace using our slightly modified image.

## Deprecation of Redis sentinel cluster/HA-cluster

As the move to the cloud and over to Naiserator, it has been decided to deprecate Naisd's Redis sentinel cluster as
this has been a major overkill for most applications, and has consumed a huge amount of resources in the clusters.
It's estimated that this uses about 1/3 of the clusters' resources.

## How to

There are two ways to get started with Redis, one for Naisd, and one for Naiserator. They both create a single Redis
instance.

### Naisd

In the [NAIS manifest][1], the following configuration can be added to enable Redis:

Minimal version:

```yaml
redis:
  enabled: true
```

All configurations:

```yaml
redis:
  enabled: true
  image: redis:5-alpine # optional
  limits: # optional
    cpu: 100m
    memory: 128Mi
  requests:
    cpu: 100m
    memory: 128Mi
```

The Redis instance can be reached via the `${appname}-redis` service.

{% hint style="warning" %}
`REDIS_HOST` will continue to point to the sentinel-setup. When everyone have moved over to standalone it will be
removed.
{% endhint %}

#### Redis metrics

To enable metrics, NAIS injects an exporter as a sidecar to the Redis pod instance for you. You can see the metrics
over at [Grafana][2].

### Naiserator (single instance)

In Naiserator, it is required to manually start your Redis instance. This means that you can only run single instances
that are not scalable; increasing replicas will only start new databases that are not synced. Contact
[@Kyrre.Havik.Eriksen][3] if you need High Availability-Redis with Naiserator.

An example Redis setup with Naiserator looks like this:

redis-config.yaml
```yaml
apiVersion: "nais.io/v1alpha1"
kind: "Application"
metadata:
  labels:
    team: ${teamname}
  name: ${appname}
  namespace: ${namespace}
spec:
  image: redis:5-alpine # or a custom Redis-image
  port: 6379
  replicas: # A single Redis-app doesn't scale
    min: 1
    max: 1
  resources: # you need to monitor the resource usage
    limits:
      cpu: 100m
      memory: 128Mi
    requests:
      cpu: 100m
      memory: 128Mi
  service:
    port: 6379
```

Then, running `kubectl apply -f redis-config.yaml` will start up a Redis instance.

It is recommended to add the following environment variable to your application's `nais.yaml` (or hard-code it in your
app, the value is not going to change):

```yaml
 env:
   - name: REDIS_HOST
     value: ${appname}.${namespace}.svc.nais.local
```

#### Redis metrics

If it is metrics are wanted from a Redis instance running on Naiserator, a separate exporter must be run. An example
`nais.yaml` for the simplest version of such an exporter is found below. NAIS has also made a dashboard that everyone
can use. The only caveat is that the exporter application needs to end its name with `redisexporter` in the
configuration. The dashboard is called [Redis exporters][4]. The dashboard sorts by `addr`, enabling a single exporter
to scrape several Redis instances.

```yaml
apiVersion: "nais.io/v1alpha1"
kind: "Application"
metadata:
  labels:
    team: ${team}
  name: ${appname}-redisexporter
  namespace: ${namespace}
spec:
  image: oliver006/redis_exporter:v1.2.0-alpine
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
  env:
    - name: REDIS_ADDR
      value: ${redis-instance}.default.svc.nais.local:6379
```

If the Redis instance is password protected, the [secure-redisexporter][5]-image must be used.

## Secure Redis (both Naisd and Naiserator)

This custom image fetches passwords from Vault. If this is needed for your project, see [baseimages][6] for more
information.

## Code examples

We are not application developers, so please help us out by expanding with examples!

### Redis cache in Spring Boot

Add the following to the Spring Boot application's `application.yaml` to enable Spring to use Redis as cache.

```text
session:
  store-type: redis
redis:
  host: ${REDIS_HOST}
  port: 6379
```

[1]: ../nais-application/manifest.md
[2]: https://grafana.adeo.no/d/Jmg7MydWz
[3]: https://nav-it.slack.com/messages/D8QQ9ELK1
[4]: https://grafana.adeo.no/d/L-Ktprrmz
[5]: https://github.com/navikt/baseimages/tree/master/redis/secure-redisexporter
[6]: https://github.com/navikt/baseimages/tree/master/redis
