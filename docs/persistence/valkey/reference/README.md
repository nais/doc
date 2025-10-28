---
title: Valkey reference
tags: [reference, valkey]
---

# Valkey reference

## Configuration options

The `spec.valkey` field takes a list of records of two fields, instance and access:

- `instance` is the instance name
- `access` is the access mode

```yaml
spec:
  valkey:
    - instance: <ValkeyInstanceName>
      access: readwrite | read | write | admin
```

For details, see the manifest reference for your workload type:

- Application: [`.spec.valkey`](../../../workloads/application/reference/application-spec.md#valkey)
- Job: [`.spec.valkey`](../../../workloads/job/reference/naisjob-spec.md#valkey)

### Access levels

Access levels grants the service user access to different [Valkey ACL categories](https://valkey.io/topics/acl/#command-categories).
The access levels are as follows:

| Access level | Description                                                                                             |
|--------------|---------------------------------------------------------------------------------------------------------|
| `read`       | `["-@all", "+@connection", "+@scripting", "+@pubsub", "+@transaction", "+@read"]`                       |
| `write`      | `["-@all", "+@connection", "+@scripting", "+@pubsub", "+@transaction", "+@write"]`                      |
| `readwrite`  | `["-@all", "+@connection", "+@scripting", "+@pubsub", "+@transaction", "+@write", "+@read"]`            |
| `admin`      | `["-@all", "+@connection", "+@scripting", "+@pubsub", "+@transaction", "+@write", "+@read", "+@admin"]` |

## Environment variables

When [using a Valkey from your workload](../how-to/use-in-workload.md), each `<ValkeyInstanceName>` you have configured will result in environment variables at runtime:

| Key                                    | Value                                                                                                                                           |
|----------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------|
| `VALKEY_URI_<ValkeyInstanceName>`      | The URI for the Valkey instance, typically with a `valkey` scheme. <br/>Example:  `valkeys://valkey-team-sessions-nav-dev.aivencloud.com:26483` |
| `VALKEY_HOST_<ValkeyInstanceName>`     | The host for the Valkey instance. <br/>Example:  `valkey-team-sessions-nav-dev.aivencloud.com`                                                  |
| `VALKEY_PORT_<ValkeyInstanceName>`     | The port for the Valkey instance. <br/>Example:  `26483`                                                                                        |
| `VALKEY_USERNAME_<ValkeyInstanceName>` | The username to use when connecting.                                                                                                            |
| `VALKEY_PASSWORD_<ValkeyInstanceName>` | The password to use when connecting.                                                                                                            |

To make the usage of Valkey backward compatible for libraries not supporting Valkeys, but only Redis, we also supply these environment variables:

| Key                                  | Value                                                                                                                                       |
|--------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------|
| `REDIS_URI_<RedisInstanceName>`      | The URI for the Redis instance, typically with a `redis` scheme. <br/>Example:  `rediss://redis-team-sessions-nav-dev.aivencloud.com:26483` |
| `REDIS_HOST_<RedisInstanceName>`     | The host for the Redis instance. <br/>Example:  `redis-team-sessions-nav-dev.aivencloud.com`                                                |
| `REDIS_PORT_<RedisInstanceName>`     | The port for the Redis instance. <br/>Example:  `26483`                                                                                     |
| `REDIS_USERNAME_<RedisInstanceName>` | The username to use when connecting.                                                                                                        |
| `REDIS_PASSWORD_<RedisInstanceName>` | The password to use when connecting.                                                                                                        |

## Metrics

If your Valkey instance is managed by [Nais Console](<<tenant_url("console")>>) or you've [created a `ServiceIntegration` manually](../how-to/create-explicit.md#serviceintegration),
you will find essential instance metrics in Nais Console in the "Insights" tab.

Metrics are not available for the `SINGLE_NODE` tier and `GB_1` memory configuration (equivalent to the `hobbyist` service plan in Aiven).

Additional metrics are available in Prometheus. For example, CPU usage percentage can be queried with:

```promql
100 - avg by (cpu) (cpu_usage_idle{service="valkey-<team>-<instance>"})
```

See the Aiven documentation for a [full list of available Valkey metrics](https://aiven.io/docs/products/valkey/reference/valkey-metrics-in-prometheus).
