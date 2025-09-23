---
tags: [how-to, valkey, redis]
---

# Create Valkey via Application (legacy)

You can create many Valkey instances for your `Application`.

!!! warning

    The steps below describe how to create a Valkey instance via a workload manifest.

    We recommend that most users instead create Valkey instances via [Nais Console](create.md).

## Prerequisites

- [Member of a Nais team](../../../explanations/team.md)

## Enable Valkey in your [manifest][app-spec-valkey]

!!! note ".nais/app.yaml"
    ```yaml
    spec:
      valkey:
        - instance: sessions
          access: readwrite
        - instance: lookup
          access: read
    ```

The above snippet will allow your application to use the `sessions` Valkey instance, and provide the application with credentials for a read/write user.
In addition, the application will get credentials for a read-only user for the `lookup` instance. See the [manifest reference][app-spec-valkey] for other options for `access`.

The default Valkey created by Nais looks like this:

```yaml
apiVersion: aiven.io/v1alpha1
kind: Valkey
metadata:
  labels:
    app: valkey-tester
    team: myteam
  name: valkey-myteam-sessions
  namespace: myteam
spec:
  plan: startup-4
  project: nav-dev
```

If all you need is a Valkey instance for one application using just the default settings, this is all you need.
If you want to share a Valkey instance across applications, or want to change configuration away from the defaults, please read the [section on explicitly creating Valkey instances](create-explicit.md).

For each Valkey instance, your application will receive three environment variables.
The environment variables use a fixed prefix, and the instance name uppercased as a suffix.

| Key                             | Value                                |
|---------------------------------|--------------------------------------|
| `VALKEY_URI_<InstanceName>`      | The URI for the instance             |
| `VALKEY_HOST_<InstanceName>`     | The host for the instance            |
| `VALKEY_PORT_<InstanceName>`     | The port for the instance            |
| `VALKEY_USERNAME_<InstanceName>` | The username to use when connecting. |
| `VALKEY_PASSWORD_<InstanceName>` | The password to use when connecting. |

[app-spec-valkey]: ../../../workloads/application/reference/application-spec.md#valkey
