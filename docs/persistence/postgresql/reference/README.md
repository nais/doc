---
title: Postgres reference
tags: [postgres, reference]
---

## Configuration

The full configuration options for the Postgres instance can be found in the [application spec reference](../../../workloads/application/reference/application-spec.md#postgres).

## Database connection

To connect your application to the database, use information from the environment variables below.

| description                                                    | environment variable                   | example                                                                                  |
|:---------------------------------------------------------------|:---------------------------------------|:-----------------------------------------------------------------------------------------|
| host                                                           | `PGHOST`                               | myapp.pg-mynamespace                                                                     |
| port                                                           | `PGPORT`                               | 5432                                                                                     |
| database name                                                  | `PGDATABASE`                           | `.spec.postgres.cluster.name` (default: app)                                             |
| database user                                                  | `PGUSER`                               | default: app-owner-user                                                                  |
| database password                                              | `PGPASSWORD`                           | (randomly generated)                                                                     |
| database url with credentials                                  | `PGURL`                                | `postgresql://username:password@myapp-pooler.pg-mynamespace:5432/app`                    |
| jdbc url with credentials [^1]                                 | `PGJDBCURL`                            | `jdbc:postgresql://myapp-pooler.pg-mynamespace:5432/app?user=username&password=password` |

!!! info
    The application containing the postgres spec is the owner of the database cluster. Although not recommended, other applications can connect by setting the environment variables explicitly in the application spec. 
    If this is done, the application must be in the same namespace as the application controlling the database cluster. We strongly recommend using the app-reader-user when doing this.

### Database max connections

The default maximum number of connections is dependent on the memory size of the database cluster, e.g. a 4GB setup will create a cluster with `max_connections` of 127. This can not be configured.

However, we deploy a pgbouncer instance in front of the database cluster to allow for more connections than the default maximum. The pgbouncer instance will limit the number of connections to 1000 by default and will queue the requests until the database is ready to process them.

### Extensions

Extensions can be installed in the database cluster by specifying them in the `nais.yaml` file under the `spec.postgres.extensions` field.
The extensions will be installed in the database cluster when the application is deployed. Several extensions are installed by default, such as `pgaudit` and `timescaledb`, as well as the postgres statistics extensions.

```yaml
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
The default collation and character set for the database cluster is `en_US.UTF-8`. This can be configured in the `nais.yaml` file under the `spec.postgres.databases.collation` field.

```yaml
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

## Cluster size

### Maximum number of connections
The default maximum number of connections is dependent on the memory size of the database cluster, e.g. a 4GB setup will create a cluster with `max_connections` of 127. This can not be configured.

However, we deploy a pgbouncer instance in front of the database cluster to allow for more connections than the default maximum. The pgbouncer instance will limit the number of connections to 1000 by default and will queue the requests until the database is ready to process them.

### Cluster instances
The [cluster instances](../explanations/postgres-cluster.md) can be configured in the application spec.
CPU, memory and disk size can be configured individually.

```yaml title="nais.yaml" hl_lines="5"
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

### Postgres database name
The Postgres database name can be configured in the application spec. The name is defined by the `name` field in the `nais.yaml` file.
This defaults to the name of the application, but can be changed to any valid Postgres database name.

```yaml title="nais.yaml" hl_lines="4"
spec:
  postgres:
    cluster:
      name: myname
```

### Postgres version

The Postgres version can be configured in the application spec. The version is defined by the `type` field in the `nais.yaml` file.

```yaml title="nais.yaml" hl_lines="4"
spec:
  postgres:
    cluster:
      majorVersion: POSTGRES_17
```

All versions from POSTGRES_14 and upwards are supported.

#TODO: create a document
:dart: [Learn how to safely upgrade the Postgres version](../how-to/upgrade-postgres.md)

### High availability

There is in essence high and higher availability for Postgres clusters in nais. By default every database cluster will consist of a primary and a replica with automatic failover. 
However, for production environments we recommend using high availability which offers a primary and two replicas. This is configured in the application spec by setting the `highAvailability` field to `true`.

```yaml title="nais.yaml" hl_lines="4"
spec:
  postgres:
    cluster:
      highAvailability: "true"
```

## Database logs

#TODO: missing logs exporting and link to loki
Postgres instances automatically collect logs that can be viewed in [loki]()

## Database metrics

Postgres instances automatically collect metrics that can be viewed in the following locations:

#TODO: update these links and add more information about the metrics available
* [Nais Console](<<tenant_url("console")>>), under the `Postgres` section.
* [Grafana](<<tenant_url("grafana")>>), using the cluster datasource.

#TODO: add link to metrics documentation
A list of all available metrics can be found []().

[:dart: Learn how to view Postgres metrics in the Google Cloud Console, Grafana, and Nais Console](../how-to/database-observability.md)

### Query insights

Not available.

## Maintenance window

The maintenance window is a period of time when the postgres-operator will perform maintenance on the Postgres instance. This includes applying updates, security patches, and other maintenance tasks to ensure the database is running smoothly.
The application should be able to handle reconnects as this maintenance is performed, the operator will perform a switchover to the replica during the maintenance.

Maintenance window can be configured in the [application spec](../../../workloads/application/reference/application-spec.md#postgresmaintenancewindow) under the `spec.postgres.maintenanceWindow` field.
The duration of the maintenance window is one hour, and it can be set to any day of the week and hour of the day.

```yaml
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

The postgres-operator will automatically perform upgrades when, fix bugs and apply security patches to prevent exploits. Your application should be able to handle occasional downtime as this maintenance is performed. [Read more on maintenance windows](https://cloud.google.com/sql/docs/postgres/maintenance). Nais does not configure the maintenance window, but this can be set up in the application spec: [`nais.yaml`](../../../workloads/application/reference/application-spec.md#gcpsqlinstances).

## Automated backup

The database is backed up once a day with a base-backup and continuously writing WAL files to the backup location. 
The retention of the backups is 14 days, meaning that backups will be kept for 14 days before they are deleted.

### Point-in-time recovery

Point-in-time recovery is enabled by default in all environments.
This feature allows you to recover your database to a specific point in time. When performing a point-in-time recovery, the database will be restored to the state it was in at the specified time, 
using the base backup and the WAL files that were written to the backup location.

### Disaster backup

In case of catastrophic failure in GCP we are running a daily complete backup of the postgresql databases to an on-prem location. This backup currently runs at 5 am. This is in addition to the regular backups in GCP.

