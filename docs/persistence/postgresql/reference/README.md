---
title: Postgres reference
tags: [postgres, reference]
---

!!! warning "Experimental feature"
    This feature is an alpha feature, and is subject to API change, instability or removal.
    See the [main Postgres page](../README.md) for more information.


## Configuration

The full configuration options for the Postgres instance can be found in the [application spec reference](../../../workloads/application/reference/application-spec.md#postgres).

## Database connection

To connect your application to the database, use information from the environment variables below.

| description                    | environment variable | example                                                                                        |
|:-------------------------------|:---------------------|:-----------------------------------------------------------------------------------------------|
| host                           | `PGHOST`             | `myapp-pooler.pg-mynamespace`                                                                  |
| port                           | `PGPORT`             | `5432`                                                                                         |
| database name                  | `PGDATABASE`         | `.spec.postgres.cluster.name` (default: app)                                                   |
| database user                  | `PGUSER`             | `app-owner-user`                                                                               |
| database password              | `PGPASSWORD`         | (randomly generated)                                                                           |
| database url with credentials  | `PGURL`              | `postgresql://app-owner-user:password@myapp-pooler.pg-mynamespace:5432/app`                    |
| jdbc url with credentials [^1] | `PGJDBCURL`          | `jdbc:postgresql://myapp-pooler.pg-mynamespace:5432/app?user=app-owner-user&password=password` |

!!! info
    The application containing the postgres spec is the owner of the database cluster. 
    Although not recommended, other applications can connect by setting the environment variables explicitly in the application spec. 
    If this is done, the application must be in the same namespace as the application controlling the database cluster.
    We strongly recommend using the `app-reader-user` when doing this.

### Database max connections

The default maximum number of connections is dependent on the memory size of the database cluster, e.g. a 4GB setup will create a cluster with `max_connections` of 127. 
This can not be configured.

However, we deploy a pgbouncer instance in front of the database cluster to allow for more connections than the default maximum. 
The pgbouncer instance will limit the number of connections to 1000 by default and will queue the requests until the database is ready to process them.

### Extensions

Extensions can be installed in the database cluster by specifying them in the `nais.yaml` file under the `spec.postgres.extensions` field.
The extensions will be installed in the database cluster when the application is deployed.
Several extensions are installed by default, such as `pgaudit` and `timescaledb`, as well as the postgres statistics extensions.

```yaml title="nais.yaml" hl_lines="10-12"
...
kind: Application
metadata:
  name: myapp
spec:
  postgres:
    cluster:
      ...
    database:
      extensions:
      - name: postgis
      - name: pgcrypto
```

### Collation and character set

The default collation and character set for the database cluster is `en_US.UTF-8`.
This can be configured in the `nais.yaml` file under the `spec.postgres.databases.collation` field.

```yaml title="nais.yaml" hl_lines="10"
...
kind: Application
metadata:
  name: myapp
spec:
  postgres:
    cluster:
      ...
    database:
      collation: nb_NO
```

### Cluster size and resources

The [cluster instances](../explanations/postgres-cluster.md) can be configured in the application spec.
CPU, memory and disk size can be configured individually.

```yaml title="nais.yaml" hl_lines="5-7"
spec:
  postgres:
    cluster:
      resources:
        cpu: 100m          # CPU in milli-cores
        memory: 2G         # Memory in GiB
        diskSize: 1Gi      # Disk size in GiB
```

Changing these values after creation of the cluster will cause the cluster instances to be restarted, and a switchover will occur when this is done.

When selecting the number of CPUs and amount of memory, there are some restrictions on the configuration you choose:

* CPU can not be bigger than the node sizes which is 16 CPUs, a database cluster larger than this will automatically create a new node pool and nodes. This can take a few minutes.
* Memory can not be bigger than the node sizes which is 64 GiB, a database cluster larger than this will automatically create a new node pool and nodes. This can take a few minutes.

### Cluster name

The Postgres cluster name can be configured in the application spec.
The name is defined by the `name` field in the `nais.yaml` file.
This defaults to the name of the application, but can be changed to any valid name.
Names must follow the [Kubernetes naming conventions](https://kubernetes.io/docs/concepts/overview/working-with-objects/names/#rfc-1035-label-names).

```yaml title="nais.yaml" hl_lines="4"
spec:
  postgres:
    cluster:
      name: myname
```

### Postgres version

The Postgres version can be configured in the application spec. 
The version is defined by the `type` field in the `nais.yaml` file.

```yaml title="nais.yaml" hl_lines="4"
spec:
  postgres:
    cluster:
      majorVersion: "17"
```

All versions from 16 and upwards are supported.

:dart: [Learn how to safely upgrade the Postgres version](../how-to/upgrade-postgres.md)

### High availability

There is in essence high and higher availability for Postgres clusters in nais.
By default, every database cluster will consist of a primary and a replica with automatic failover. 
However, for production environments we recommend using high availability which offers a primary and two replicas for better resilience. 
This is configured in the application spec by setting the `highAvailability` field to `true`.

```yaml title="nais.yaml" hl_lines="4"
spec:
  postgres:
    cluster:
      highAvailability: "true"
```

## Database logs

!!! info "Database logs are not available at this time"
    For now, the only logs available are the logs from the Patroni manager and related scripts.
    The logs from Postgres itself are not available, but will be available in the future.

## Database metrics

Postgres instances automatically collect metrics that can be viewed in [Grafana](<<tenant_url("grafana")>>), using the cluster datasource.

[:dart: Learn how to view Postgres metrics in the Google Cloud Console, Grafana, and Nais Console](../how-to/database-observability.md)

### Query insights

!!! info "Query insights are not available at this time"
    For now, we have not found a suitable replacement for the Google Cloud SQL Query Insights feature.
    We are looking into alternatives, but for now, you will have to rely on the metrics and logs available.

## Maintenance window

The maintenance window is a period of time when the postgres-operator will perform maintenance on the Postgres instance.
This includes applying updates, security patches, and other maintenance tasks to ensure the database is running smoothly.
The application should be able to handle reconnects as this maintenance is performed, the operator will perform a switchover to the replica during the maintenance.
If no maintenance window is set, the operator will perform maintenance at any time.

Nais does not configure a maintenance window by default.
Maintenance window can be configured in the [application spec](../../../workloads/application/reference/application-spec.md#postgresmaintenancewindow) under the `spec.postgres.maintenanceWindow` field.
The duration of the maintenance window is one hour, and it can be set to any day of the week and hour of the day.

```yaml title="nais.yaml" hl_lines="9-11"
...
kind: Application
metadata:
  name: myapp
spec:
  postgres:
    cluster:
      ...
    maintenanceWindow:
      day: 3 # 3 = Wednesday
      hour: 3 # 3 = 03:00
```

## Automated backup

The database is backed up once a day with a base-backup and continuously writing WAL files to the backup location. 

### Point-in-time recovery

Point-in-time recovery is enabled by default in all environments.
This feature allows you to recover your database to a specific point in time. 
When performing a point-in-time recovery, the database will be restored to the state it was in at the specified time, using the base backup and the WAL files that were written to the backup location.

### Disaster backup

!!! info "Disaster backup are not available at this time"
    For now, we have not added disaster backup functionality to the Postgres instances.
    In the future, we will add the option of daily logical database dumps, which can be saved to a backup location. 
