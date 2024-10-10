---
title: Postgres reference
tags: [postgres, reference]
---

## Configuration

The full configuration options for the Postgres instance can be found in the [application spec reference](../../../workloads/application/reference/application-spec.md#gcpsqlinstances).

## Database connnection

To connect your application to the database, use information from the environment variables below.

| description                                                    | environment variable                   | example                                                                    |
| :------------------------------------------------------------- | :------------------------------------- | :------------------------------------------------------------------------- |
| ip                                                             | `NAIS_DATABASE_MYAPP_MYDB_HOST`        | 100.10.1.0                                                                 |
| port                                                           | `NAIS_DATABASE_MYAPP_MYDB_PORT`        | 5432                                                                       |
| database name                                                  | `NAIS_DATABASE_MYAPP_MYDB_DATABASE`    | `.spec.gcp.sqlInstances[].databases[].name`                                |
| database user                                                  | `NAIS_DATABASE_MYAPP_MYDB_USERNAME`    | `.spec.gcp.sqlInstances[].name`                                            |
| database password                                              | `NAIS_DATABASE_MYAPP_MYDB_PASSWORD`    | (randomly generated)                                                       |
| database url with credentials                                  | `NAIS_DATABASE_MYAPP_MYDB_URL`         | `postgresql://username:password@100.10.1.0:5432/mydb?sslcert=...`          |
| *Below variables only available for instances with private IP* |                                        |                                                                            |
| jdbc url with credentials [^1]                                 | `NAIS_DATABASE_MYAPP_MYDB_JDBC_URL`    | `jdbc:postgresql://100.10.1.0:5432/mydb?password=...&user=...&sslcert=...` |
| path to root cert                                              | `NAIS_DATABASE_MYAPP_MYDB_SSLROOTCERT` | `/var/run/secrets/nais.io/sqlcertificate/root-cert.pem`                    |
| path to client cert                                            | `NAIS_DATABASE_MYAPP_MYDB_SSLCERT`     | `/var/run/secrets/nais.io/sqlcertificate/cert.pem`                         |
| path to client key                                             | `NAIS_DATABASE_MYAPP_MYDB_SSLKEY`      | `/var/run/secrets/nais.io/sqlcertificate/key.pem`                          |
| path to client key in DER format                               | `NAIS_DATABASE_MYAPP_MYDB_SSLKEY_PK8`  | `/var/run/secrets/nais.io/sqlcertificate/key.pk8`                          |
| ssl mode                                                       | `NAIS_DATABASE_MYAPP_MYDB_SSLMODE`     | `verify-ca`                                                                |

!!! info
    The application is the only application that can access the database instance. Other applications can not connect. It is not, for instance,
    possible to have two applications (e.g. producer and consumer) connecting directly to the database.

### Naming conventions

The prefix `NAIS_DATABASE_MYAPP_MYDB` is automatically generated from the instance name `myapp` \(defaults to application name\) and `mydb` \(from database spec\).

You can customize these environment variable names by setting `.spec.gcp.sqlInstances[].databases[].envVarPrefix`.

For instance, setting this to `DB` will give you `DB_HOST`, `DB_USERNAME`, etc. Note that changing or adding `envVarPrefix` requires you to manually delete the `google-sql-<MYAPP>` secret and `SQLUser` with the same name as the application, see below.

If you have hyphens (`-`) in your application name or database name, they will be converted to underscores (`_`). E.g. `my-awesome-app` = `MY_AWESOME_APP`.

!!! info
    Note that if you change your application name, database name or envVarPrefix, and then change it later,
    you have to manually [reset database credentials](../how-to/reset-database-credentials.md).

[^1]: jdbc url can be generated for instances without private IP by using [nais-cli] to rotate the password.

## Database flags

!!! warning
    Use database flags with caution, they will alter the behaviour of your postgres instance.

Postgres in gcp supports setting database flags to alter the database instance performance and functionality,
the flags available are listed here: [Google Cloud SQL supported flags](https://cloud.google.com/sql/docs/postgres/flags#list-flags-postgres).
This listing specifies what value types are expected, which ranges are allowed and if a restart is required.

Example of setting database flags:

```yaml
...
kind: Application
metadata:
  name: myapp
spec:
  gcp:
    sqlInstances:
      - type: POSTGRES_14
        tier: db-f1-micro
        databases:
          - name: mydb
        flags:
        - name: autovacuum_max_workers
          value: "10"                           #integer in google spec, requires restart
        - name: autovacuum
          value: "on"                           #boolean in google spec
        - name: autovacuum_analyze_scale_factor
          value: "2"                            #float in google spec
```

!!! info
    The value is always required to be a string in [`nais.yaml`](../../../workloads/application/reference/application-spec.md).

### Database max connections

The default maximum number of connections is dependent on the memory size of the instance and can be configured with the `max_connections` flag. The smallest instance size has a default of 25 maximum connections.

Default connection limits for different memory sizes can be found on [Google Cloud SQL Configure database flags](https://cloud.google.com/sql/docs/postgres/flags#postgres-m).

!!! info
    The actual connection limit for your application may be lower than the configured value due some connections being reserved for superusers and other internal processes.

## Database metrics

Postgres instances automatically collect metrics that can be viewed in the following locations:

* [Google Cloud Console](https://console.cloud.google.com/monitoring), under the `Cloud SQL` section.
* [NAIS Console](<<tenant_url("console")>>), under the `Postgres` section.
* [Grafana](<<tenant_url("grafana")>>), using the `Google CLoud Monitoring` datasource.

A list of all avaialbe metrics can be found on [Cloud SQL metrics](https://cloud.google.com/sql/docs/postgres/admin-api/metrics).

[:dart: Learn how to view Postgres metrics in the Google Cloud Console, Grafana, and NAIS Console](../how-to/database-observability.md)

### Query insights

Query insights are now enabled by default in GCP. This feature provides query overview and analysis.
The data is available in the Google cloud console.

For further reading see [Google Cloud SQL Query Insights](https://cloud.google.com/sql/docs/postgres/using-query-insights#introduction)

!!! info
    Data is available for seven days, increasing this will incur extra cost.

## Maintenance window

Google will automatically perform upgrades, fix bugs and apply security patches to prevent exploits. Your application should be able to handle occasional downtime as this maintenance is performed. [Read more on maintenance windows](https://cloud.google.com/sql/docs/postgres/maintenance). NAIS does not configure the maintenance window, but this can be set up in the application spec: [`nais.yaml`](../../../workloads/application/reference/application-spec.md#gcpsqlinstances).
If you wish to be notified about upcoming maintenance, you can opt-in for this on the [Communications page](https://console.cloud.google.com/user-preferences/communication) in the GCP console.

## Automated backup

The database is backed up nightly at 3 AM \(GMT+1\) by default, but can be overridden in [`nais.yaml`](../../../workloads/application/reference/application-spec.md#gcpsqlinstancesautobackuphour) by setting `spec.gcp.sqlInstances[].autoBackupTime`.
By default, seven backups will be kept. More info [about Cloud SQL backups](https://cloud.google.com/sql/docs/postgres/backup-recovery/backups).

The backups can be found in the [Google Cloud SQL instance](https://cloud.google.com/sql) dashboard.

### Point-in-time recovery

Point-in-time recovery can be enabled by configuring this in the sql instance for your application spec.
This feature allows you to recover your database to a specific point in time.

!!! info
    This feature is not enabled by default. When enabled the Postgres instance will be restarted.

!!! warning
    Use this feature with automatic storage increase enabled.

See [application spec reference.](https://doc.nais.io/nais-application/application/#gcpsqlinstancespointintimerecovery)
For further reading see [google Cloud SQL PIT recovery](https://cloud.google.com/sql/docs/postgres/backup-recovery/pitr)

### Disaster backup

In case of catastrophic failure in GCP we are running a daily complete backup of the postgresql databases in GCP to an on-prem location. This backup currently runs at 5 am. This is in addition to the regular backups in GCP.

## Postgres version

The Postgres version can be configured in the application spec. The version is defined by the `type` field in the `nais.yaml` file.

```yaml title="app.yaml" hl_lines="4"
spec:
  gcp:
    sqlInstances:
      - type: POSTGRES_16
```

The full list of supported versions can be found in the [application spec reference](../../../workloads/application/reference/application-spec.md#gcpsqlinstancestype).

:dart: [Learn how to safely upgrade the Postgres version](../how-to/upgrade-postgres.md)

## Server size

The [server instance](../explanations/cloud-sql-instance.md) size can be configured in the application spec.
The instance size is defined by the `tier` field in the `nais.yaml` file.

```yaml title="app.yaml" hl_lines="5"
spec:
  gcp:
    sqlInstances:
      - type: POSTGRES_16
        tier: db-custom-2-5120
```

:dart: [Learn how to change the server instance tier](../how-to/change-tier.md)

The tier can be set to one of the following values:

[Cloud SQL SLA]: https://cloud.google.com/sql/sla

| Tier                    | Description                                            |
| ----------------------- | ------------------------------------------------------ |
| `db-f1-micro`           | Shared CPU, 0.6 GB RAM, not covered by [Cloud SQL SLA] |
| `db-g1-small`           | Shared CPU, 1.7 GB RAM, not covered by [Cloud SQL SLA] |
| `db-custom-1-3840`      | 1 CPU, 3.75 GB RAM                                     |
| `db-custom-2-5120`      | 2 CPUs, 5 GB RAM                                       |
| `db-custom-2-7680`      | 2 CPUs, 7.5 GB RAM                                     |
| `db-custom-4-15360`     | 4 CPUs, 15 GB RAM                                      |
| `db-custom-<CPU>-<RAM>` | Custom tier, see below                                 |

The custom tiers can be customized to fit your application's requirements, following this format:

* Replace the `<CPU>` placeholder with the number of CPUs
* Replace the `<RAM>` placeholder with the amount of memory.

When selecting the number of CPUs and amount of memory, there are some restrictions on the configuration you choose:

* CPU must be either 1 or an even number between 2 and 96.
* Memory must be:
    * 0.9 to 6.5 GB per vCPU
    * A multiple of 256 MB
    * At least 3.75 GB (3840 MB)
