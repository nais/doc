---
tags:
  - redis
---

# Redis

Nais provides Redis by way of Aiven via their Aiven Operator.

## Configuration options

The `spec.redis` field takes a list of records of two fields, instance and access. Instance is the instance name and access is the access mode.

```yaml
    spec:
      redis:
        - instance: <RedisInstanceName>
          access: readwrite | read | write | admin
```

every `<RedisInstanceName> will give three environment variables for the applications to use,

| Key                                | Value                                                                                                                                       |
|------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------|
| `REDIS_URI_<RedisInstanceName>`      | The URI for the Redis instance, typically with a `redis` scheme. <br/>Example:  `rediss://redis-team-sessions-nav-dev.aivencloud.com:26483` |
| `REDIS_USERNAME_<RedisInstanceName>` | The username to use when connecting.                                                                                                        |
| `REDIS_PASSWORD_<RedisInstanceName>` | The password to use when connecting.                                                                                                        |
