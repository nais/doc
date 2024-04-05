

# Aiven Resources

Nais provides Redis and OpenSearch through Aiven via their Aiven Operator.

You can create many Redis instances for your `Application` and exactly one OpenSearch instance.


## 0. Prerequisites
- [Member of a NAIS team](../../explanation/team.md)

!!! warning
    It is not possible to share Redis instances between teams.

## 1. Enable Redis and/or OpenSearch in your [manifest](../../reference/application-spec.md)

???+ note ".nais/app.yaml"
    ```yaml
    spec:
      redis:
        - instance: sessions
          access: readwrite
        - instance: lookup
          access: read
      openSearch:
        - instance: search
          access: readwrite
    ```


The above snippet will allow your application to use the `sessions` Redis instance, and provide the application with credentials for a read/write user.
In addition, the application will get credentials for a read-only user for the `lookup` instance.
See the [manifest reference](../../reference/application-spec.md#redis) for other options for `access`.

Similarly, your application will also have access to an OpenSearch instance named `search` with `readwrite` access.

If all you need is a Redis instance for one application using just the default settings, this is all you need.
If you want to share a Redis instance across applications, or want to change configuration away from the defaults, please read the [section on explicitly creating redis instances](../create-redis-instance-explicitly.md).

You can also [create an OpenSearch instance manually](../create-opensearch-instance-explicitly.md) in order to provide other defaults etc.

For each redis or opensearch instance, your application will receive three environment variables.
The environment variables use a fixed prefix, and the instance name uppercased as a suffix.

| Key    | Value                                |                                      |
|--------|--------------------------------------|--------------------------------------|
| <REDIS | OPEN_SEARCH>_URI_<InstanceName>      | The URI for the instance             |
| <REDIS | OPEN_SEARCH>_USERNAME_<InstanceName> | The username to use when connecting. |
| <REDIS | OPEN_SEARCH>_PASSWORD_<InstanceName> | The password to use when connecting. |
