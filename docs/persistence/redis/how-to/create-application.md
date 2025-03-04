---
tags: [how-to, redis]
---

# Create Redis via Application

You can create many Redis instances for your `Application`.

## Prerequisites
- [Member of a Nais team](../../../explanations/team.md)

!!! warning 

    It is not possible to share Redis instances between teams.

## Enable Redis in your [manifest][app-spec-redis]

!!! note ".nais/app.yaml"
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
reference][app-spec-redis] for other
options for `access`.

The default Redis created by Nais looks like this:

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

If all you need is a Redis instance for one application using just the
default settings, this is all you need. If you want to share a Redis
instance across applications, or want to change configuration away
from the defaults, please read the [section on explicitly creating
Redis instances](create-explicit.md).

For each Redis instance, your application will receive
three environment variables. The environment variables use a fixed
prefix, and the instance name uppercased as a suffix.

| Key                             | Value                                |
|---------------------------------|--------------------------------------|
| `REDIS_URI_<InstanceName>`      | The URI for the instance             |
| `REDIS_HOST_<InstanceName>`     | The host for the instance            |
| `REDIS_PORT_<InstanceName>`     | The port for the instance            |
| `REDIS_USERNAME_<InstanceName>` | The username to use when connecting. |
| `REDIS_PASSWORD_<InstanceName>` | The password to use when connecting. |

[app-spec-redis]: ../../../workloads/application/reference/application-spec.md#redis
