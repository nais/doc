# Redis
This guide will show you hwo to install and use redis in your application

(TODO: split this howto into explantion and howtos for creating and using redis)

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

## Creating a Redis instance explicitly

We recommend creating your Redis instances in their own workflow for more control over configuration, especially if you intend for multiple applications using the same Redis instance, or if you need to change configuration.

Creating a Redis instance is done by adding a Redis resource to your namespace with detailed configuration.
Some configuration is enforced by the nais platform, while the rest is up to the users.

Earlier we talked about the "instance name". 
In reality, the actual name of the redis instance will be `redis-<team name>-<instance name>` (where `team name` is the same as the namespace your application resides in).
The resource needs to have this full name in order to be accepted.

The default Redis created by nais looks like this:

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
(TODO: nav only)
A minimal Redis resource only requires `plan` and `project`.

 * `project` should match your nais tenant (`nav`, `mtpilot`, `ssb` or `fhi`) and the environment you are running in (ex. `dev`, `prod`), with a dash (`-`) in between.
 * `plan` is the Aiven plan for your Redis instance. 
   See Aivens list of [possible plan values](https://aiven.io/pricing?product=redis). 
   The values are lowercased.
   Make sure you understand the differences between the plans before selecting the one you need.
   Examples: `startup-4`, `startup-56`, `business-4`, `premium-14`.

We use Aivens operator, so the Redis resource is [documented in detail](https://aiven.github.io/aiven-operator/api-reference/redis.html) in the Aiven documentation.
You should look at the reference for any other fields that might be of interest.

Probably the most important value to consider is which plan to use.

The Startup plans are good for things like sessions or cache usage, where High Availability in case of failures is not important.
Upgrades and regular maintenance is handled without noticeable downtime, by adding a new upgraded node and replicating data over to it before switching over DNS and shutting down the old node.
Startup plans are backed up every 12 hours, keeping 1 backup available.

If you require HA, the Business plans provide for one failover node that takes over should your primary instance fail for any reason.
When using business plans, a second node is always available with continuous replication, so it is able to start serving data immediately should the primary node fail.
Business plans are backed up every 12 hours, keeping 3 days of backups available.

Once the resource is added to the cluster, some additional fields are filled in by the platform and should be left alone unless you have a good reason:

| field                   |                                                                                                       | 
|-------------------------|-------------------------------------------------------------------------------------------------------|
| `projectVpcId`          | Ensures the instance is connected to the correct project VPC and is not available on public internet. |
| `tags`                  | Adds tags to the instance used for tracking billing in Aiven.                                         |
| `cloudName`             | Where the Redis instance should run.                                                                  |  
| `terminationProtection` | Protects the instance against unintended termination. Must be set to `false` before deletion.         |

There are some fields available that should not be used:

| field                  |                                                                                                 |
|------------------------|-------------------------------------------------------------------------------------------------|
| `authSecretRef`        | Reference to a secret containing an Aiven API token. Provided via other mechanisms.             |
| `connInfoSecretTarget` | Name of secret to put connection info in, not used as nais provides these via other mechanisms. |
| `projectVPCRef`        | Not used since we use `projectVpcId`.                                                           |
| `serviceIntegrations`  | Not used at this time.                                                                          |
