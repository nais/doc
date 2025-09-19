---
tags: [how-to, valkey, redis]
---

# Create a Valkey instance explicitly (legacy)

!!! warning

    The steps below describe how to create a Valkey instance explicitly via a Kubernetes resource manifest.

    <!-- TODO: Add reference to Nais TOML when ready -->
    For an easier experience, we recommend that most users instead create Valkey instances via [Nais Console](create.md).

## Prerequisites
- [Member of a Nais team](../../../explanations/team.md)

We recommend creating your Valkey instances in their own workflow for more control over configuration, especially if you intend for multiple applications using the same Valkey instance, or if you need to change configuration.

Creating a Valkey instance is done by adding a Valkey resource to your namespace with detailed configuration.
Some configuration is enforced by the Nais platform, while the rest is up to the users.

Earlier we talked about the "instance name".
In reality, the actual name of the valkey instance will be `valkey-<team name>-<instance name>` (where `team name` is the same as the namespace your application resides in).
The resource needs to have this full name in order to be accepted. However, when referencing the instance from the nais spec you only need to use the `<instance name>` nais
will fill in the rest.

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

A minimal Valkey resource only requires `plan` and `project`.

 * `project` should match your Nais tenant (`<<tenant()>>`) and the environment you are running in (ex. `dev`, `prod`), with a dash (`-`) in between.
 * `plan` is the Aiven plan for your Valkey instance.
   See Aivens list of [possible plan values](https://aiven.io/pricing?product=valkey).
   The values are lowercased.
   Make sure you understand the differences between the plans before selecting the one you need.
   Examples: `startup-4`, `startup-56`, `business-4`, `premium-14`.

We use Aivens operator, so the Valkey resource is [documented in detail](https://aiven.github.io/aiven-operator/resources/valkey.html) in the Aiven documentation.
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
| `projectVpcId`          | Ensures the instance is connected to the correct project VPC and is not available on public Internet. |
| `tags`                  | Adds tags to the instance used for tracking billing in Aiven.                                         |
| `cloudName`             | Where the Valkey instance should run.                                                                 |
| `terminationProtection` | Protects the instance against unintended termination. Must be set to `false` before deletion.         |

There are some fields available that should not be used:

| field                  |                                                                                                 |
|------------------------|-------------------------------------------------------------------------------------------------|
| `authSecretRef`        | Reference to a secret containing an Aiven API token. Provided via other mechanisms.             |
| `connInfoSecretTarget` | Name of secret to put connection info in, not used as Nais provides these via other mechanisms. |
| `projectVPCRef`        | Not used since we use `projectVpcId`.                                                           |
| `serviceIntegrations`  | Not used at this time.                                                                          |

{% if tenant() in ("nav", "dev-nais") %}

### ServiceIntegration

A ServiceIntegration is used to integrate the Valkey instance with Prometheus.
It is pretty straight forward, with little to no configuration needed.

Simple 5 steps procedure:

1. Copy the below yaml into a file (it can be the same file as your Valkey instance)
2. Replace `<ENV>` with the environment you are running in (ex. `dev`, `prod`) (in field `project`)
3. Replace `<MYTEAM>` with your team name (in `labels`, `namespace` and `sourceServiceName`)
4. Replace `<INSTANCE>` with the last part of the name of your Valkey instance (in `name` and `sourceServiceName`)
5. Replace `<ENDPONT-ID>` with the endpoint ID from the table below (in `destinationEndpointId`)
6. Deploy the resource using the same pipeline as you use for your Valkey instance


!!! note "valkey.yaml"
    ```yaml
    ---
    apiVersion: aiven.io/v1alpha1
    kind: ServiceIntegration
    metadata:
        labels:
            team: <MYTEAM>
        name: valkey-<MYTEAM>-<INSTANCE>
        namespace: <MYTEAM>
    spec:
        project: <<tenant()>>-<ENV>
        integrationType: prometheus
        destinationEndpointId: <ENDPONT-ID>
        sourceServiceName: valkey-<MYTEAM>-<INSTANCE>
    ```

#### Prometheus Endpoint IDs

{% if tenant() == "nav" %}

| Environment | Endpoint ID                          |
|-------------|--------------------------------------|
| nav-dev     | f20f5b48-18f4-4e2a-8e5f-4ab3edb19733 |
| nav-prod    | 76685598-1048-4f56-b34a-9769ef747a92 |

{% elif tenant() == "dev-nais" %}

| Environment  | Endpoint ID                          |
|--------------|--------------------------------------|
| dev-nais-dev | cc2fd0ad-9e62-492e-b836-86aa9654fd9b |

{% endif %}

{% endif %}

## 
