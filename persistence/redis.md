---
description: >
  Redis is an open source (BSD licensed) in-memory data structure store used as a database, cache and message broker.
---

# Redis

Redis on NAIS is run without disk/storage. This means that if a Redis instance is restarted due to something like
maintenance, the data will be lost. In other words, *do not* store data here that you cannot afford to lose.

It's also possible to password protect the Redis instace using our slightly modified image.

## How to

### Naiserator

On NAIS you're required to manually start your Redis instance. This means that you can only run single instances
that are not scalable; increasing replicas will only start new databases that are not synced. Contact
[@Kyrre.Havik.Eriksen] if you need High Availability-Redis.

An example Redis setup looks like this:

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
  image: redis:<latest-docker-tag> # or a custom Redis-image
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

{% hint style="success" %}Check out [hub.docker.com] for latest version{% endhint %}

It is recommended to add the following environment variable to your application's `nais.yaml` (or hard-code it in your
app, the value is not going to change):

```yaml
 env:
   - name: REDIS_HOST
     value: ${appname}.${namespace}.svc.nais.local
```

#### Redis metrics

If metrics are wanted from a Redis instance running on NAIS, a separate exporter must be run. An example
`nais.yaml` for the simplest version of such an exporter is found below. NAIS has also made a dashboard that everyone
can use. The only caveat is that the exporter application needs to end its name with `redisexporter` in the
configuration. The dashboard is called [Redis exporters]. The dashboard sorts by `addr`, enabling a single exporter
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
  image: oliver006/redis_exporter:<latest-docker
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
      value: ${redis-instance}:6379
    - name: REDIS_EXPORTER_LOG_FORMAT
      value: json
```

{% hint style="success" %}Check out [github.com/oliver006] for latest version{% endhint %}

If the Redis instance is password protected, the [secure-redisexporter]-image must be used.

## Secure Redis

This custom image fetches passwords from Vault. If this is needed for your project, see [baseimages] for more
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

[NAIS manifest]: ../nais-application/reference.md
[Grafana]: https://grafana.adeo.no/d/Jmg7MydWz
[@Kyrre.Havik.Eriksen]: https://nav-it.slack.com/messages/D8QQ9ELK1
[Redis exporters]: https://grafana.adeo.no/d/L-Ktprrmz
[secure-redisexporter]: https://github.com/navikt/baseimages/tree/master/redis/secure-redisexporter
[baseimages]: https://github.com/navikt/baseimages/tree/master/redis
[hub.docker.com]: https://hub.docker.com/_/redis
[github.com/oliver006]: https://github.com/oliver006/redis_exporter/releases
