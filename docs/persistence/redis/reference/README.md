---
title: Redis reference
tags: [redis, reference]
---

# Redis reference

## Configuration options

The `spec.redis` field takes a list of records of two fields, instance and access. Instance is the instance name and access is the access mode.

```yaml
spec:
  redis:
    - instance: <RedisInstanceName>
      access: readwrite | read | write | admin
```

## Environment variables

Every `<RedisInstanceName>` will give three environment variables for the applications to use:

| Key                                  | Value                                                                                                                                       |
|--------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------|
| `REDIS_URI_<RedisInstanceName>`      | The URI for the Redis instance, typically with a `redis` scheme. <br/>Example:  `rediss://redis-team-sessions-nav-dev.aivencloud.com:26483` |
| `REDIS_HOST_<RedisInstanceName>`     | The host for the Redis instance. <br/>Example:  `redis-team-sessions-nav-dev.aivencloud.com`                                                |
| `REDIS_PORT_<RedisInstanceName>`     | The port for the Redis instance. <br/>Example:  `26483`                                                                                     |
| `REDIS_USERNAME_<RedisInstanceName>` | The username to use when connecting.                                                                                                        |
| `REDIS_PASSWORD_<RedisInstanceName>` | The password to use when connecting.                                                                                                        |

## Advanced configuration

For advanced configuration, we recommend [creating your Redis instances explicitly](../how-to/create-explicit.md), especially if you intend for multiple applications using the same Redis instance.

We use Aivens operator, so the Redis resource is [documented in detail](https://aiven.github.io/aiven-operator/api-reference/redis.html) in the Aiven documentation.
