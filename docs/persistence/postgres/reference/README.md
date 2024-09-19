---
title: Postgres reference
tags: [postgres, reference]
---

## Configuration

To connect your application to the database, use information from the environment variables below.

The prefix `NAIS_DATABASE_MYAPP_MYDB` is automatically generated from the instance name `myapp` \(defaults to application name\) and `mydb` \(from database spec\). You can customize these environment variable names by setting `.spec.gcp.sqlInstances[].databases[].envVarPrefix`. For instance, setting this to `DB` will give you `DB_HOST`, `DB_USERNAME`, etc. Note that changing or adding `envVarPrefix` requires you to manually delete the `google-sql-<MYAPP>` secret and `SQLUser` with the same name as the application, see below.

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

!!! info
    Note that if you change your application name, database name or envVarPrefix, and then change it later,
    you have to manually [reset database credentials](../how-to/reset-database-credentials.md).

!!! info
    Note that if your application name or database has hyphens in the name, the hyphens are converted to underscores. E.g. my-awesome-app = MY_AWESOME_APP

[^1]: jdbc url can be generated for instances without private IP by using [nais-cli] to rotate the password.

### Database flags

!!! info
    Use database flags with caution, they will alter the behaviour of your postgres instance.

Postgres in gcp supports setting database flags to alter the database instance performance and functionality,
the flags available are listed here: [Google Cloud SQL supported flags](https://cloud.google.com/sql/docs/postgres/flags#list-flags-postgres).
This listing specifies what value types are expected, which ranges are allowed and if a restart is required.

!!! info
    The value is always required to be a string in [`nais.yaml`](../../../workloads/application/reference/application-spec.md).

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

#### Database max connections

The default maximum number of connections is dependent on the memory size of the instance and can be configured with the `max_connections` flag. The smallest instance size has a default of 25 maximum connections.

Default connection limits for different memory sizes can be found on [Google Cloud SQL Configure database flags](https://cloud.google.com/sql/docs/postgres/flags#postgres-m).

!!! info
    The actual connection limit for your application may be lower than the configured value due some connections being reserved for superusers and other internal processes.

### Database Metrics

Postgres instances automatically collect metrics that can be viewed in the following locations:

* [Google Cloud Console](https://console.cloud.google.com/monitoring), under the `Cloud SQL` section.
* [NAIS Console](<<tenant_url("console")>>), under the `Postgres` section.
* [Grafana](<<tenant_url("grafana")>>), using the `Google CLoud Monitoring` datasource.

A list of all avaialbe metrics can be found on [Cloud SQL metrics](https://cloud.google.com/sql/docs/postgres/admin-api/metrics).

[:dart: Learn how to view Postgres metrics in the Google Cloud Console, Grafana, and NAIS Console](../how-to/database-observability.md)

### Query Insights

Query insights are now enabled by default in GCP. This feature provides query overview and analysis.
The data is available in the Google cloud console.

For further reading see [Google Cloud SQL Query Insights](https://cloud.google.com/sql/docs/postgres/using-query-insights#introduction)

!!! info
    Data is available for seven days, increasing this will incur extra cost.

### Maintenance window

Google will automatically perform upgrades, fix bugs and apply security patches to prevent exploits. Your application should be able to handle occasional downtime as this maintenance is performed. [Read more on maintenance windows](https://cloud.google.com/sql/docs/postgres/maintenance). NAIS does not configure the maintenance window, but this can be set up in the application spec: [`nais.yaml`](../../../workloads/application/reference/application-spec.md#gcpsqlinstances).
If you wish to be notified about upcoming maintenance, you can opt-in for this on the [Communications page](https://console.cloud.google.com/user-preferences/communication) in the GCP console.

### Automated backup

The database is backed up nightly at 3 AM \(GMT+1\) by default, but can be overridden in [`nais.yaml`](../../../workloads/application/reference/application-spec.md#gcpsqlinstancesautobackuphour) by setting `spec.gcp.sqlInstances[].autoBackupTime`.
By default, seven backups will be kept. More info [about Cloud SQL backups](https://cloud.google.com/sql/docs/postgres/backup-recovery/backups).

The backups can be found in the [Google Cloud SQL instance](https://cloud.google.com/sql) dashboard.

#### Point-in-time recovery
Point-in-time recovery can be enabled by configuring this in the sql instance for your application spec.
This feature allows you to recover your database to a specific point in time.

!!! info
    This feature is not enabled by default. When enabled the Postgres instance will be restarted.

!!! warning
    Use this feature with automatic storage increase enabled.

See [application spec reference.](https://doc.nais.io/nais-application/application/#gcpsqlinstancespointintimerecovery)
For further reading see [google Cloud SQL PIT recovery](https://cloud.google.com/sql/docs/postgres/backup-recovery/pitr)

#### Disaster backup
In case of catastrophic failure in GCP we are running a daily complete backup of the postgresql databases in GCP to an on-prem location. This backup currently runs at 5 am. This is in addition to the regular backups in GCP.
