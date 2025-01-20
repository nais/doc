---
title: Valkey reference
tags: [reference, valkey]
---

# Valkey reference

## Configuration options

The `spec.valkey` field takes a list of records of two fields, instance and access. Instance is the instance name and access is the access mode.

```yaml
spec:
  valkey:
    - instance: <ValkeyInstanceName>
      access: readwrite | read | write | admin
```

## Environment variables

Every `<ValkeyInstanceName>` will give three environment variables for the applications to use:

| Key                                    | Value                                                                                                                                           |
|----------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------|
| `VALKEY_URI_<ValkeyInstanceName>`      | The URI for the Valkey instance, typically with a `valkey` scheme. <br/>Example:  `valkeys://valkey-team-sessions-nav-dev.aivencloud.com:26483` |
| `VALKEY_HOST_<ValkeyInstanceName>`     | The host for the Valkey instance. <br/>Example:  `valkey-team-sessions-nav-dev.aivencloud.com`                                                  |
| `VALKEY_PORT_<ValkeyInstanceName>`     | The port for the Valkey instance. <br/>Example:  `26483`                                                                                        |
| `VALKEY_USERNAME_<ValkeyInstanceName>` | The username to use when connecting.                                                                                                            |
| `VALKEY_PASSWORD_<ValkeyInstanceName>` | The password to use when connecting.                                                                                                            |

## Advanced configuration

For advanced configuration, we recommend [creating your Valkey instances explicitly](../how-to/create-explicit.md), especially if you intend for multiple applications using the same Valkey instance.

We use Aivens operator, so the Valkey resource is [documented in detail](https://aiven.github.io/aiven-operator/api-reference/valkey.html) in the Aiven documentation.
