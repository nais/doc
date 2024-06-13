---
tags: [explanation, persistence, services]
---

# Google Cloud SQL / PostgreSQL

!!! info
    Postgres 15 has changed the security model around the public schema and it is no longer world writeable. If you and your team
    make use of the public schema for interactive sessions and experimentation you will have to create separate schemas for separate users and share these role or user grants. Normal app usage will function normally.

PostgreSQL is a relational database service that is provided by Google Cloud Platform. It is a good choice for storing data that is relational in nature.

You can provision and configure [Postgres](https://www.postgresql.org/) through your [`application manifest`](../../workloads/application/reference/application-spec.md).

The database is provisioned into the teams own project in GCP. Here the team has full access to view logs, create and restore backups and other administrative database tasks.

When you deploy your application with database config, NAIS will ensure the database exists in a [Google Cloud SQL instance](https://cloud.google.com/sql) with the specified [Postgres](https://cloud.google.com/sql/docs/postgres/) version, and configure the application with means to connect to it.

The Database instance takes a few minutes to be created, so your app will not be able to connect to right away. This only applies to the first time deploy.

Below is an example of the minimal configuration needed. See all configuration options in the [application manifest reference](../../workloads/application/reference/application-spec.md#gcpsqlinstances).

```yaml
...
apiVersion: nais.io/v1alpha1
kind: Application
metadata:
  name: myapp
...
spec:
  ...
  gcp:
    sqlInstances:
      - type: POSTGRES_14
        databases:
          - name: mydb
```

!!! important "Choosing the right tier for production"

    By default, the database server is `db-f1-micro` which has 1 vCPU, 614 MB RAM and 10GB of SSD storage with no automatic storage increase. Shared CPU machine types (`db-f1-micro` and `db-g1-small`) are **NOT** covered by the [Cloud SQL SLA](https://cloud.google.com/sql/sla). Consider [changing](../../workloads/application/reference/application-spec.md#gcpsqlinstancestier) to the `db-custom-CPU-RAM` tier for your production databases. Please also note that exhausting disk and/or CPU with automatic increase disabled is [not](https://cloud.google.com/sql/docs/postgres/operational-guidelines) covered by the SLA.

## Example with all configuration options

See [full example](../../workloads/application/reference/application-example.md).

## FAQ

### `FATAL: password authentication failed for user "<user>"`

!!! faq "Answer"

    The synchronization of the password to the database may have failed.
    See [workaround for password synchronization issues](how-to/password-sync-issues.md).

### Cloud Sql Conditions messages

#### Invalid request: backup retention should be >= transaction log retention

!!! faq "Answer"
    This error occurs when the backup retention is set to a value lower than the transaction log retention. 
    The backup retention should be equal to or greater than the transaction log retention. 
    You can fix this by setting the `retainedBackups` to a value equal to or greater than the transaction log retention or 
    by setting the `transactionLogRetentionDays` to a value equal to or less than the backup retention.
    This can be configured in the [NAIS manifest](../../workloads/application/reference/application-spec.md#gcpsqlinstances). 
    Read more about [automated backups with cloud sql](https://cloud.google.com/sql/docs/mysql/backup-recovery/backups#automated-backups).

#### Cannot disable cloudsql.logical_decoding while there are logical replication slots

!!! faq "Answer"
    This error occurs when you try to disable logical decoding while there are logical replication slots.
    [Notes and limitations](https://cloud.google.com/sql/docs/postgres/replication/configure-logical-replication#limitations-general) on disabling logical decoding.

#### ...immutable field(s): [Field Name: settings.0.diskSize, Got: x, Wanted: xx]...

!!! faq "Answer"
    This error occurs when you try to change the disk size of the database instance. 
    The disk size settings of the database instance cannot be less then current size after the instance is created. 
    You can fix this by specifying in the [NAIS manifest](../../workloads/application/reference/application-spec.md#gcpsqlinstancesdisksize) 
    the desired disk size of the database instance to be equal to or greater than the current size.
    If you want to control the disk size of the instance you should disable [automatic storage increase](../../workloads/application/reference/application-spec.md#gcpsqlinstancesdiskautoresize).

#### Not allowed to do major version upgrade from POSTGRES_x to POSTGRES_xx

!!! faq "Answer"
    This error occurs when you try to 'upgrade' the major version of the database instance to a version that is not allowed.
    You cant downgrade the major version of the database instance, if you want to downgrade the version you need to create 
    a new instance with the desired version.
    You can fix this by specifying in the [NAIS manifest](../../workloads/application/reference/application-spec.md#gcpsqlinstancestype)
    the version type to the same as the current or a higher version.

[nais-cli]: ../../operate/cli/how-to/install.md
