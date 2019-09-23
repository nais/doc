---
description: Redis is an open source \(BSD licensed\) in-memory data structure store used as a database, cache and message broker.
---

# Redis

On NAIS we are running Redis without disk/storage. This means that if your Redis instance is restarted due to e.g. maintenance, your data will be lost. This means that you shouldn't store data here that you can't afford to lose. It's also possible to password protect the Redis instace, using our sligthly modified image.

## Deprecation of Redis sentinel cluster/HA-cluster

As we move to the cloud, and over to Naiserator, we have decided to deprecate Naisd's Redis sentinel cluster, as this has been a major overkill for most applications and has consumed a huge amount of resources in the clusters. It's estimated to use about 1/3 of our clusters resources.

## How to

There is two ways to get running with Redis, one for Naisd, and one for Naiserator. They both create a single Redis-instance for you to use.

### Naisd

In the [NAIS manifest](/in-depth/nais-manifest.md) you can add the following configuration to enable Redis:

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

The Redis instance can be reached via the `<appname>-redis` service.

{% hint style="warning" %}
`REDIS_HOST` will continue to point to the sentinel-setup. When everyone have merged over to standalone it will be removed.
{% endhint %}

#### Redis metrics

To enable metrics we have injected an exporter as a sidecar to the Redis pod instance for you. You can see the metrics over at [Grafana](https://grafana.adeo.no/d/Jmg7MydWz).

### Naiserator \(single instance\)

In Naiserator you are required to manually start your Redis-storage. This means that you can only run single instances that are not scalable. Aka increasing replicas will only start new databases that are not synced. Contact [@Kyrre.Havik.Eriksen](https://nav-it.slack.com/messages/D8QQ9ELK1) if you need HA-Redis with Naiserator.

This is done with `kubectl apply -f redis-config.yaml` using the config below.

```yaml
apiVersion: "nais.io/v1alpha1"
kind: "Application"
metadata:
  labels:
    team: <teamname>
  name: <appname>
  namespace: <namespace>
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

In your `nais.yaml` you should to add the following environment variable \(or hard-code it in your app, they are not going to change\):

```yaml
 env:
   - name: REDIS_HOST
     value: <appname>.<namespace>.svc.nais.local
```

#### Redis metrics

If you want metrics scraped from you Redis-instance, you need to run your own exporer. You can find the nais.yaml for the simplest version below, and we've also made a dashboard that everyone can use. The only cavete is that the exporter-application needs to end its name with `redisexporter`. The dashboard is called [Redis exporters](https://grafana.adeo.no/d/L-Ktprrmz). The dashboard sorts by `addr`, letting us use one exporter to scrape several Redis-instances.

```text
apiVersion: "nais.io/v1alpha1"
kind: "Application"
metadata:
  labels:
    team: <team>
  name: <appname>-redisexporter
  namespace: <namespace>
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
      value: <redis-instance>.default.svc.nais.local:6379
```

If your Redis-instance is password protected you need to use our own [secure-redisexporter](https://github.com/navikt/baseimages/tree/master/redis/secure-redisexporter)-image.

## Secure Redis \(both Naisd and Naiserator\)

We have made our own image that uses password from Vault, if this is needed for your project. See [baseimages](https://github.com/navikt/baseimages/tree/master/redis) for more information.

## Code example

We are not app-developers, so please help us out by expanding with examples!

### Redis cache in Spring Boot

Add the following to your `application.yaml` to enable Spring to use Redis as cache.

```text
session:
  store-type: redis
redis:
  host: ${REDIS_HOST}
  port: 6379
```
