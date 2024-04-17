# Google Cloud SQL / PostgreSQL

!!! info
    Postgres 15 has changed the security model around the public schema and it is no longer world writeable. If you and your team
    make use of the public schema for interactive sessions and experimentation you will have to create separate schemas for separate users and share these role or user grants. Normal app usage will function normally.

PostgreSQL is a relational database service that is provided by Google Cloud Platform. It is a good choice for storing data that is relational in nature.

You can provision and configure [Postgres](https://www.postgresql.org/) through your [`application manifest`](../../../reference/application-spec.md).

The database is provisioned into the teams own project in GCP. Here the team has full access to view logs, create and restore backups and other administrative database tasks.

When you deploy your application with database config, NAIS will ensure the database exists in a [Google Cloud SQL instance](https://cloud.google.com/sql) with the specified [Postgres](https://cloud.google.com/sql/docs/postgres/) version, and configure the application with means to connect to it.

The Database instance takes a few minutes to be created, so your app will not be able to connect to right away. This only applies to the first time deploy.

Below is an example of the minimal configuration needed. See all configuration options in the [application manifest reference](../../../reference/application-spec.md#gcpsqlinstances).

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
    By default, the database server is `db-f1-micro` which has 1 vCPU, 614 MB RAM and 10GB of SSD storage with no automatic storage increase. Shared CPU machine types (`db-f1-micro` and `db-g1-small`) are **NOT** covered by the [Cloud SQL SLA](https://cloud.google.com/sql/sla). Consider [changing](../../../reference/application-spec.md#gcpsqlinstancestier) to the `db-custom-CPU-RAM` tier for your production databases. Please also note that exhausting disk and/or CPU with automatic increase disabled is [not](https://cloud.google.com/sql/docs/postgres/operational-guidelines) covered by the SLA.

## Configuration

To connect your application to the database, use information from the environment variables below.

The prefix `NAIS_DATABASE_MYAPP_MYDB` is automatically generated from the instance name `myapp` \(defaults to application name\) and `mydb` \(from database spec\). You can customize these environment variable names by setting `.spec.gcp.sqlInstances[].databases[].envVarPrefix`. For instance, setting this to `DB` will give you `DB_HOST`, `DB_USERNAME`, etc. Note that changing or adding `envVarPrefix` requires you to manually delete the `google-sql-<MYAPP>` secret and `SQLUser` with the same name as the application, see below.

| description                   | environment variable                   | example                                                         |
|:------------------------------|:---------------------------------------|:----------------------------------------------------------------|
| ip                            | `NAIS_DATABASE_MYAPP_MYDB_HOST`        | 100.10.1.0                                                      |
| port                          | `NAIS_DATABASE_MYAPP_MYDB_PORT`        | 5432                                                            |
| database name                 | `NAIS_DATABASE_MYAPP_MYDB_DATABASE`    | `.spec.gcp.sqlInstances[].databases[].name`                     |
| database user                 | `NAIS_DATABASE_MYAPP_MYDB_USERNAME`    | `.spec.gcp.sqlInstances[].name`                                 |
| database password             | `NAIS_DATABASE_MYAPP_MYDB_PASSWORD`    | \(randomly generated\)                                          |
| database url with credentials | `NAIS_DATABASE_MYAPP_MYDB_URL`         | `postgres://username:password@100.10.1.0:5432/mydb?sslcert=...` |
| path to root cert             | `NAIS_DATABASE_MYAPP_MYDB_SSLROOTCERT` | `/var/run/secrets/nais.io/sqlcertificate/root-cert.pem`         |
| path to client cert           | `NAIS_DATABASE_MYAPP_MYDB_SSLCERT`     | `/var/run/secrets/nais.io/sqlcertificate/cert.pem`              |
| path to client key            | `NAIS_DATABASE_MYAPP_MYDB_SSLKEY`      | `/var/run/secrets/nais.io/sqlcertificate/key.pem`               |

!!! info
    The application is the only application that can access the database instance. Other applications can not connect. It is not, for instance,
    possible to have two applications (e.g. producer and consumer) connecting directly to the database.

!!! info
    Note that if you change your application name, database name or envVarPrefix, and then change it later,
    you have to manually [reset database credentials](#reset-database-credentials).

### Database flags

!!! info
    Use database flags with caution, they will alter the behaviour of your postgres instance.

Postgres in gcp supports setting database flags to alter the database instance performance and functionality,
the flags available are listed here: [Google Cloud SQL supported flags](https://cloud.google.com/sql/docs/postgres/flags#list-flags-postgres).
This listing specifies what value types are expected, which ranges are allowed and if a restart is required.

!!! info
    The value is always required to be a string in [`nais.yaml`](../../../reference/application-spec.md).

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

### Query Insights
Query insights are now enabled by default in GCP. This feature provides query overview and analysis.
The data is available in the Google cloud console.

For further reading see [Google Cloud SQL Query Insights](https://cloud.google.com/sql/docs/postgres/using-query-insights#introduction)

!!! info
    Data is available for seven days, increasing this will incur extra cost.

### Maintenance window
Google will automatically perform upgrades, fix bugs and apply security patches to prevent exploits. Your application should be able to handle occasional downtime as this maintenance is performed. [Read more on maintenance windows](https://cloud.google.com/sql/docs/postgres/maintenance). NAIS does not configure the maintenance window, but this can be set up in the application spec: [`nais.yaml`](../../../reference/application-spec.md#gcpsqlinstances).
If you wish to be notified about upcoming maintenance, you can opt-in for this on the [Communications page](https://console.cloud.google.com/user-preferences/communication) in the GCP console.

### Automated backup
The database is backed up nightly at 3 AM \(GMT+1\) by default, but can be overridden in [`nais.yaml`](../../../reference/application-spec.md#gcpsqlinstancesautobackuptime) by setting `spec.gcp.sqlInstances[].autoBackupTime`.
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

## Cloud SQL credentials
Cloud SQL uses ConfigConnector/CNRM to create and manage all relevant resources (sqldatabase, sqlinstance, sqluser, credentials) for postgreSQL.
When creating an application via your nais.yaml the database in your google project, along with other necessary resources, are created.
The creation of the database takes about ten minutes, and the credential settings will be updated after the database is ready for use.

!!! warning
    If you delete and recreate your app, new credentials will be created and a synchronization is needed.
    This process can take up to ten minutes. Using the workaround described below you can avoid this synchronization period.

### Workaround for password synchronization issues

We recommend using [nais-cli](../../nais-cli/install.md) for rotating password for your Postgres database user.

```bash
nais postgres password rotate appname
```

#### Manually

Retrieve the password from the secret google-sql-`MYAPP` in your namespace (the password is base64 encoded):

```shell
kubectl get secret google-sql-<MYAPP> -o jsonpath="{ .data['<YOUR PASSWORD VARIABLE>'] }" | base64 -d
```

Log in to the Google [Cloud Console](https://console.cloud.google.com) and set the password manually for the application user in the sql instance:
SQL -> `DB_INSTANCE` -> Users -> `USERNAME` -> Change password

### Reset database credentials

!!! info
    If you have multiple sql users their names will be on the format: `<MYAPP>-<MYDB>-<SQLUSERNAME>` instead of `<MYAPP>`

To reset the database credentials for your application (if application name, database name or envVarPrefix has been changed), you need to first delete the secret and sqluser for the database:

```bash
$ kubectl delete secret google-sql-<MYAPP>
$ kubectl delete sqluser <MYAPP>
```

Then either redeploy your application or force a synchronization of your application:

```bash
kubectl patch application <MYAPP> -p '[{"op": "remove", "path": "/status/synchronizationHash"}]' --type=json
```

## Cloud SQL Proxy (instances created before 2024-04-18)

The application will connect to the database using [Cloud SQL Proxy](https://cloud.google.com/sql/docs/postgres/sql-proxy), ensuring that the database communication happens in secure tunnel, authenticated with automatically rotated credentials.

NAIS will add and configure the proxy client container as a sidecar in the pod, making it available on `localhost` for the application. The application will then connect to the proxy using standard database protocol just as if it was the actual database.

![The diagram shows how the application connects to the database using Cloud SQL Proxy. Cloud SQL connects to an instance, the proxy server communicates with the proxy client using a TCP secure tunnel. The proxy client is a sidecar in the pod,  available on the localhost for the application on the client machine.](../../../assets/sqlproxy.svg)

For more detailed information, check out the [Cloud SQL Proxy documentation](https://cloud.google.com/sql/docs/postgres/sql-proxy)

## Additional user(s) database(s)

You can add users to your database by setting database configuration option: `.spec.gcp.sqlInstances[].databases[].users[].name`.
Additional users needs to manually be given access to the database and table.
Either directly or with Flyway or other database migration tools.

Names added must match regex: `^[_a-zA-Z][_a-zA-Z0-9]+$`. Secrets is generated and mounted for each user.

With `.spec.gcp.sqlInstances[].databases[].envVarPrefix` set to `DB` and additional username to `_user2` you will get environment variables in format `DB_USER2_MYDB_USERNAME` etc.

!!! info
    If you've deployed your application with an additional users, and then change name or remove the user from configuration, you need to _manually_ delete the `google-sql-<MYAPP>-<USER>` secret:
    ```bash
    $ kubectl delete secret google-sql-<MYAPP>-<USER>
    ```

## Personal database access

Databases should always be accessed using a personal account, and the access should ideally be temporary.

!!! info
    [Personal database access can also be configured using the nais-cli](../../nais-cli/install.md).

### Prerequisites

???+ check "Step 1. Install local binaries"

    This guide assumes that you have the following installed on your local machine:

    - [nais-cli](../../nais-cli/install.md)
    - kubectl
    - (Optionally for cli access) [psql binary](https://blog.timescale.com/how-to-install-psql-on-mac-ubuntu-debian-windows/)

    We will use the `nais postgres` command from the CLI to set up the database access.

???+ check "Step 2. Allow your user to edit Cloud SQL resources for your project"
    Ensure that you have authenticated `gcloud` by running

    ```bash
    nais login
    ```

???+ check "Step 3. Select the context and namespace of your application"
    If you have installed [kubectx](https://github.com/ahmetb/kubectx) you can use the following command to select the context and namespace of your application:

    ```bash
    kubectx <CLUSTER>
    kubens <TEAM>
    ```

    If you do not have kubectx installed, you can use the following command to select the context and namespace of your application:

    ```bash
    kubectl config use-context <CLUSTER>
    kubectl config set-context --current --namespace=<TEAM>
    ```

???+ check "Step 3. One-time setup of privileges to SQL IAM users"

    This is only required once per database instance.

    Once the database instance is created, we need to grant the IAM users access to the `public` schema.

    ```bash
    nais postgres prepare <MYAPP>
    ```

    Prepare will prepare the postgres instance by connecting using the
    application credentials and modify the permissions on the public schema.
    All IAM users with correct permissions in your GCP project will be able to connect to the instance.

    The default is to allow only `SELECT` statements. If you need to allow all privileges, you can use the `--all-privs` flag.

    ```bash
    nais postgres prepare --all-privs <MYAPP>
    ```

### Granting temporary personal access

???+ check "Step 1. Create database IAM user"

    This is required once per user and requires that you have access to the team's GCP project.

    ```bash
    nais postgres grant <MYAPP>
    ```

    This will give you a limited time access to the database unless there's already an existing permission for your user.

???+ check "Step 3. Log in with personal user"

    Use `nais postgres proxy` to create a secure tunnel to the database.

    ```bash
    nais postgres proxy <MYAPP>
    ```

    This will start a proxy client in the background and print the connection string to the database.

    Authenticate using your personal Google account email as username and leave the password empty.

    If you'd like to use the psql binary, you can use the following command to connect to the database:

    ```bash
    nais postgres psql <MYAPP>
    ```

    This will create a proxy on a random port and execute the psql binary with the correct connection string.

## Upgrading major version

Before doing a major version upgrade, you should check the Cloud SQL docs on [upgrading PostgreSQL for an instance](https://cloud.google.com/sql/docs/postgres/upgrade-major-db-version) for any preparation that needs to be done.

When you are ready, you can change `type` in your `nais.yaml` to a new major version of PostgreSQL, and redeploy, and the upgrade will start.
For safe upgrades, it is recommended to only do one major version at a time.

!!! warning
    Upgrading requires the instance to become unavailable for a period of time depending on the size of your database (expect 10 minutes or more of downtime).
    Be sure to schedule your upgrade when your application can be offline.

## Deleting the database

The database is not automatically removed when deleting your NAIS application. Remove unused databases to avoid incurring unnecessary costs. This is done by setting [cascadingDelete](../../../reference/application-spec.md#gcpsqlinstancescascadingdelete) in your `nais.yaml`-specification.

!!! danger
    When you delete an Cloud SQL instance, you cannot reuse the name of the deleted instance until one week from the deletion date.

## Debugging

Check the events on the [Config Connector](https://cloud.google.com/config-connector/docs/overview) resources

```text
$ kubectl describe sqlinstance <myapp>
$ kubectl describe sqldatabase <mydb>
$ kubectl describe sqluser <myapp>
```

Check the logs of the Cloud SQL Proxy (if instance uses cloudsql-proxy)

```text
$ kubectl logs <pod> -c cloudsql-proxy
```

## Example with all configuration options

See [full example](../../../reference/application-example.md).

## FAQ

### `FATAL: password authentication failed for user "<user>"`

???+ faq "Answer"
    The synchronization of the password to the database may have failed.
    See [workaround for password synchronization issues](#workaround-for-password-synchronization-issues).

### Connect to a cloned database-instance

???+ faq "Answer"
    If you have for some reason cloned a database in the console, you need to do some manually changes on the new database to be allowed to connect to it.
    First you need to log in to with the old username and password, then run `GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO "cloned-user";` to give the new cloned user access to all the old tables. If you have objects outside of tables those also needs to be changed.
    Also remember to delete the `google-sql-appname`-secret from the cluster, so new secrets are generated for the cloned database.
    After this you can update your `nais.yaml`-file to use the instance name of the cloned database instead of the old ones.
    Remeber to delete the old database when you are finished.

### Cloud Sql Conditions messages

#### Invalid request: backup retention should be >= transaction log retention

???+ faq "Answer"
    This error occurs when the backup retention is set to a value lower than the transaction log retention. 
    The backup retention should be equal to or greater than the transaction log retention. 
    You can fix this by setting the `retainedBackups` to a value equal to or greater than the transaction log retention or 
    by setting the `transactionLogRetentionDays` to a value equal to or less than the backup retention.
    This can be configured in the [NAIS manifest](../../../reference/application-spec.md#gcpsqlinstances). 
    Read more about [automated backups with cloud sql](https://cloud.google.com/sql/docs/mysql/backup-recovery/backups#automated-backups).

#### Cannot disable cloudsql.logical_decoding while there are logical replication slots

???+ faq "Answer"
    This error occurs when you try to disable logical decoding while there are logical replication slots.
    [Notes and limitations](https://cloud.google.com/sql/docs/postgres/replication/configure-logical-replication#limitations-general) on disabling logical decoding.
