# Redis

Nais provides Redis through Aiven via their Aiven
Operator.

You can create many Redis instances for your `Application`.

## 0. Prerequisites
- [Member of a NAIS team](../../../explanation/team.md)

!!! warning It is not possible to share Redis instances between teams.

## 1. Enable Redis in your [manifest](../../../reference/application-spec.md)

???+ note ".nais/app.yaml"
    ```yaml
    spec:
      redis:
        - instance: sessions
          access: readwrite
        - instance: lookup
          access: read
    ```


The above snippet will allow your application to use the `sessions`
Redis instance, and provide the application with credentials for a
read/write user. In addition, the application will get credentials for
a read-only user for the `lookup` instance. See the [manifest
reference](../../../reference/application-spec.md#redis) for other
options for `access`.

If all you need is a Redis instance for one application using just the
default settings, this is all you need. If you want to share a Redis
instance across applications, or want to change configuration away
from the defaults, please read the [section on explicitly creating
redis instances](./create-redis-instance-explicitly.md).

For each edis instance, your application will receive
three environment variables. The environment variables use a fixed
prefix, and the instance name uppercased as a suffix.

| Key                             | Value                                |   |
|---------------------------------|--------------------------------------|---|
| `REDIS_URI_<InstanceName>`      | The URI for the instance             |   |
| `REDIS_USERNAME_<InstanceName>` | The username to use when connecting. |   |
| `REDIS_PASSWORD_<InstanceName>` | The password to use when connecting. |   |
