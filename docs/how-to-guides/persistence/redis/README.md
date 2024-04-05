# Redis
This guide will show you how to install and use redis in your application

## 0. Prerequisites
- [Member of a NAIS team](../../explanation/team.md)

!!! warning
    It is not possible to share Redis instances between teams.

## 1. Enable redis in your [manifest](../../reference/application-spec.md#redis)

???+ note ".nais/app.yaml"
    ```yaml
    spec:
      redis:
        - instance: sessions
          access: readwrite
        - instance: lookup
          access: read
    ```


The above snippet will allow your application to use the `sessions` Redis instance, and provide the application with credentials for a read/write user.
In addition, the application will get credentials for a read-only user for the `lookup` instance.
See the reference for other options for `access`.

If all you need is a Redis instance for one application using just the default settings, this is all you need.
If you want to share a Redis instance across applications, or want to change configuration away from the defaults, read the next section.

For each instance added to this list, your application will receive three environment variables.
The environment variables use a fixed prefix, and the instance name uppercased as a suffix.

Example for the sessions instance used above:
(TODO: how do we fix this for non-nav=)

| Key                     | Value                                                                                                                                        |
|-------------------------|----------------------------------------------------------------------------------------------------------------------------------------------|
| REDIS_URI_SESSIONS      | The URI for the Redis instance, typically with a `rediss` scheme. <br/>Example:  `rediss://redis-team-sessions-nav-dev.aivencloud.com:26483` |
| REDIS_USERNAME_SESSIONS | The username to use when connecting.                                                                                                         |
| REDIS_PASSWORD_SESSIONS | The password to use when connecting.                                                                                                         |

So far we have used `sessions` as the instance name, but you can name your redis instance what you want with some restrictions.

When you refer to redis in your `Application`, nais will look for a redis instance with the given name, or attempt to create one with default settings if it doesn't exist.
