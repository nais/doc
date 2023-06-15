---
description: >-
  NAIS offers a managed PostgreSQL database as a service through Google Cloud
  SQL. This page describes how to use it.
---

# Google Cloud SQL PostgreSQL

!!! info
    This feature is only available in GCP clusters. If you need on-prem databases, head over to [navikt/database-iac](https://github.com/navikt/database-iac).

PostgreSQL is a relational database service that is provided by Google Cloud Platform. It is a good choice for storing data that is relational in nature.

You can provision and configure [Postgres](https://www.postgresql.org/) through [`nais.yaml`](../nais-application/application.md).

The database is provisioned into the teams own project in GCP. Here the team has full access to view logs, create and restore backups and other administrative database tasks.

When you deploy your application with database config, NAIS will ensure the database exists in a [Google Cloud SQL instance](https://cloud.google.com/sql) with the specified [Postgres](https://cloud.google.com/sql/docs/postgres/) version, and configure the application with means to connect to it.

The Database instance takes a few minutes to be created, so your app will not be able to connect to right away. This only applies to the first time deploy.

Below is an example of the minimal configuration needed. See all configuration options in the [nais.yaml reference](../nais-application/application.md#gcpsqlinstances).

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
    By default, the database server is `db-f1-micro` which has 1 vCPU, 614 MB RAM and 10GB of SSD storage with no automatic storage increase. Shared CPU machine types (`db-f1-micro` and `db-g1-small`) are **NOT** covered by the [Cloud SQL SLA](https://cloud.google.com/sql/sla). Consider [changing](../nais-application/application.md#gcpsqlinstancestier) to the `db-custom-CPU-RAM` tier for your production databases. Please also note that exhausting disk and/or CPU with automatic increase disabled is [not](https://cloud.google.com/sql/docs/postgres/operational-guidelines) covered by the SLA.

## Configuration

To connect your application to the database, use information from the environment variables below.

The prefix `NAIS_DATABASE_MYAPP_MYDB` is automatically generated from the instance name `myapp` \(defaults to application name\) and `mydb` \(from database spec\). You can customize these environment variable names by setting `.spec.gcp.sqlInstances[].databases[].envVarPrefix`. For instance, setting this to `DB` will give you `DB_HOST`, `DB_USERNAME`, etc. Note that changing or adding `envVarPrefix` requires you to manually delete the `google-sql-<MYAPP>` secret and `SQLUser` with the same name as the application, see below.

| key                           | environment variable                | default                                            |
|:------------------------------|:------------------------------------|:---------------------------------------------------|
| hostname                      | `NAIS_DATABASE_MYAPP_MYDB_HOST`     | 127.0.0.1                                          |
| port                          | `NAIS_DATABASE_MYAPP_MYDB_PORT`     | 5432                                               |
| database name                 | `NAIS_DATABASE_MYAPP_MYDB_DATABASE` | `.spec.gcp.sqlInstances[].databases[].name`        |
| database user                 | `NAIS_DATABASE_MYAPP_MYDB_USERNAME` | `.spec.gcp.sqlInstances[].name`                    |
| database password             | `NAIS_DATABASE_MYAPP_MYDB_PASSWORD` | \(randomly generated\)                             |
| database url with credentials | `NAIS_DATABASE_MYAPP_MYDB_URL`      | `postgres://username:password@127.0.0.1:5432/mydb` |

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
    The value is always required to be a string in [`nais.yaml`](../nais-application/application.md).

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

For further reading see [Google Cloud SQL Query Insights](https://cloud.google.com/sql/docs/postgres/query-insights-overview)

!!! info
    Data is available for seven days, increasing this will incur extra cost.

### Maintenance window
Google will automatically perform upgrades, fix bugs and apply security patches to prevent exploits. Your application should be able to handle occasional downtime as this maintenance is performed. [Read more on maintenance windows](https://cloud.google.com/sql/docs/postgres/maintenance). NAIS does not configure the maintenance window, but this can be set up in the application spec: [`nais.yaml`](../nais-application/application.md#gcpsqlinstances).
If you wish to be notified about upcoming maintenance, you can opt-in for this on the [Communications page](https://console.cloud.google.com/user-preferences/communication) in the GCP console.

### Automated backup
The database is backed up nightly at 3 AM \(GMT+1\) by default, but can be overridden in [`nais.yaml`](../nais-application/application.md#gcpsqlinstancesautobackuptime) by setting `spec.gcp.sqlInstances[].autoBackupTime`.
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

## Metrics
Metrics for each Postgres can be found in [Grafana](https://grafana.nais.io/d/AVwFIm0Mz/cloudsql-gcp?orgId=1).

## Cloud SQL credentials
Cloud SQL uses ConfigConnector/CNRM to create and manage all relevant resources (sqldatabase, sqlinstance, sqluser, credentials) for postgreSQL.
When creating an application via your nais.yaml the database in your google project, along with other necessary resources, are created.
The creation of the database takes about ten minutes, and the credential settings will be updated after the database is ready for use.

!!! warning
    If you delete and recreate your app, new credentials will be created and a synchronization is needed.
    This process can take up to ten minutes. Using the workaround described below you can avoid this synchronization period.

### Workaround for password synchronization issues

We recommend using [nais-cli](../cli) for rotating password for your Postgres database user.

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

## Cloud SQL Proxy

The application will connect to the database using [Cloud SQL Proxy](https://cloud.google.com/sql/docs/postgres/sql-proxy), ensuring that the database communication happens in secure tunnel, authenticated with automatically rotated credentials.

NAIS will add and configure the proxy client container as a sidecar in the pod, making it available on `localhost` for the application. The application will then connect to the proxy using standard database protocol just as if it was the actual database.

![The diagram shows how the application connects to the database using Cloud SQL Proxy. Cloud SQL connects to an instance, the proxy server communicates with the proxy client using a TCP secure tunnel. The proxy client is a sidecar in the pod,  available on the localhost for the application on the client machine.](../assets/sqlproxy.svg)

For more detailed information, check out the [Cloud SQL Proxy documentation](https://cloud.google.com/sql/docs/postgres/sql-proxy)

## Additional user(s) database(s)

You can add users to your database by setting database configuration option: `.spec.gcp.sqlInstances[].databases[].users[].name`.
Additional users needs to manually be given access to the database and table.
Either directly or with Flyway or other database migration tools.

Names added must match regex: `^[_a-zA-Z][_a-zA-Z0-9]+$`. Secrets is generated and mounted for each user.

With `.spec.gcp.sqlInstances[].databases[].envVarPrefix` set to `DB` and additional username to `_user2` you will get environment variables in format `DB_USER2_MYDB_USERNAME` etc.

Details about environment variables is specified her: [`configuration`](../persistence/postgres.md#configuration)

!!! info
    If you've deployed your application with an additional users, and then change name or remove the user from configuration, you need to _manually_ delete the `google-sql-<MYAPP>-<USER>` secret:
    ```bash
    $ kubectl delete secret google-sql-<MYAPP>-<USER>
    ```

## Personal database access

Databases should always be accessed using a personal account, and the access should ideally be temporary.

!!! info
    [Personal database access can also be configured using the nais-cli](../cli/commands/postgres.md).

### Prerequisites

???+ check "Step 1. Install local binaries"

    This guide assumes that you have the following installed on your local machine:

    - [cloudsql-proxy binary](https://cloud.google.com/sql/docs/postgres/sql-proxy#install)
    - [psql binary](https://blog.timescale.com/how-to-install-psql-on-mac-ubuntu-debian-windows/)

???+ check "Step 2. Allow your user to edit Cloud SQL resources for your project"
    Ensure that you have authenticated `gcloud` by running

    ```bash
    gcloud auth login
    ```

    To be able to perform the gcloud commands mentioned below you need a role with user edit permissions, e.g. `roles/cloudsql.admin`

    To grant yourself this role for a given project, run the following command:

    ```bash
    gcloud projects add-iam-policy-binding <project-id> \
        --member user:<your-email> \
        --role roles/cloudsql.admin \
        --condition="expression=request.time < timestamp('$(date -v '+1H' -u +'%Y-%m-%dT%H:%M:%SZ')'),title=temp_access"
    ```

    where `<project-id>` can be found by running:

    ```bash
    gcloud projects list \
        --filter=<team>
    ```

???+ check "Step 3. One-time setup of privileges to SQL IAM users"

    This is only required once per database instance and should be done before DDL scripts are run in the database in order to ensure the objects have the right permissions.

    Once the database instance is created, we need to grant the IAM users access to the `public` schema.

    This can either be done by using the default application database user during database creation/migration with scripts (e.g. Flyway), or as a one-time setup by using the default `postgres` user.

???+ check "Step 3a. Set password for `postgres` user"

    In order to use the `postgres` user, you have to set a password first:

    ```bash
    gcloud sql users set-password postgres \
        --instance=<INSTANCE_NAME> \
        --prompt-for-password \
        --project <PROJECT_ID>
    ```

???+ check "Step 3b. Log in to the database with the `postgres` user"

    Set up the `cloudsql-proxy`:

    ```bash
    CONNECTION_NAME=$(gcloud sql instances describe <INSTANCE_NAME> \
        --format="get(connectionName)" \
        --project <PROJECT_ID>);

    cloud_sql_proxy -instances=${CONNECTION_NAME}=tcp:5432
    ```

    Log in to the database (you will be prompted for the password you set in the previous step):

    ```bash
    psql -U postgres -h localhost <DATABASE_NAME> -W
    ```

    If you are using Cloud SQL Auth proxy v1.21.0 or newer you can get the token in the cloud_sql_proxy command so you can run the psql-command without the -W parameter:
    ```bash
    cloud_sql_proxy -enable_iam_login -instances=${CONNECTION_NAME}=tcp:5432
    ```

???+ check "Step 3c. Enable privileges for user(s) in database"

    This can be enabled for all `cloudsqliamusers` (all IAM users are assigned the role `cloudsqliamuser`) with the following command:

    ```sql
    alter default privileges in schema public grant all on tables to cloudsqliamuser;
    ```

    Or for a specific user (the given IAM user must exist in the database):

    ```sql
    alter default privileges in schema public grant all on tables to "user@nav.no";
    ```

    If your application created the tables before you were able to run these commands, then the owner of the tables is set to the application's user.

    Thus, your application must run the following command either through your chosen database migration tool (e.g. Flyway) or manually with the application user's credentials:

    ```sql
    grant all on all tables in schema public to cloudsqliamuser;
    ```

### Granting temporary personal access

???+ check "Step 1. Create database IAM user"

    This is required once per user and requires that you have create user permission in IAM in your project, e.g. Cloud SQL Admin.

    To grant yourself this role for a given project, run the following command:

    ```bash
    gcloud projects add-iam-policy-binding <project-id> \
        --member user:<your-email> \
        --role roles/cloudsql.admin \
        --condition="expression=request.time < timestamp('$(date -v '+1H' -u +'%Y-%m-%dT%H:%M:%SZ')'),title=temp_access"
    ```

    Then, to create the database IAM user:

    ```bash
    gcloud beta sql users create <FIRSTNAME>.<LASTNAME>@nav.no \
        --instance=<INSTANCE_NAME> \
        --type=cloud_iam_user \
        --project <PROJECT_ID>
    ```

???+ check "Step 2. Create a temporary IAM binding for 1 hour"

    Generally, you should try to keep your personal database access time-limited.

    The following command grants your user permission to log into the database for 1 hour.

    If your system has GNU utilities installed:

    ```bash
    gcloud projects add-iam-policy-binding <PROJECT_ID> \
        --member=user:<FIRSTNAME>.<LASTNAME>@nav.no \
        --role=roles/cloudsql.instanceUser \
        --condition="expression=request.time < timestamp('$(date --iso-8601=seconds -d '+1 hours')'),title=temp_access"
    ```

    Otherwise (e.g. MacOS users):

    ```bash
    gcloud projects add-iam-policy-binding <PROJECT_ID> \
        --member=user:<FIRSTNAME>.<LASTNAME>@nav.no \
        --role=roles/cloudsql.instanceUser \
        --condition="expression=request.time < timestamp('$(date -v '+1H' -u +'%Y-%m-%dT%H:%M:%SZ')'),title=temp_access"
    ```

???+ check "Step 3. Log in with personal user"

    Ensure that the `cloudsql-proxy` is up and running, if not then:

    ```bash
    CONNECTION_NAME=$(gcloud sql instances describe <INSTANCE_NAME> \
      --format="get(connectionName)" \
      --project <PROJECT_ID>);

    cloud_sql_proxy -instances=${CONNECTION_NAME}=tcp:5432
    ```

    Then, connect to the database:

    ```bash
    export PGPASSWORD=$(gcloud auth print-access-token)

    psql -U <FIRSTNAME>.<LASTNAME>@nav.no -h localhost <DATABASE_NAME>
    ```

## Upgrading major version

In-place database upgrades through `nais.yaml` is currently not supported. If you attempt to change the version this way, you will not get an error message, but your `sqlinstances`-resource in the cluster will not update and change its status to `UpdateFailed`.

In order to upgrade the database version, you will need to follow the Cloud SQL docs on [upgrading PostgreSQL for an instance](https://cloud.google.com/sql/docs/postgres/upgrade-major-db-version).
After the upgrade has been done through the Google Cloud Console you need to manually delete the `sqlinstance`-resource from the cluster.
First then can you change your `nais.yaml`-file and redeploy.

!!! warning
    Upgrading requires the instance to become unavailable for a period of time. Be sure to schedule your upgrade when database activity is low.

## Deleting the database

The database is not automatically removed when deleting your NAIS application. Remove unused databases to avoid incurring unnecessary costs. This is done by setting [cascadingDelete](../nais-application/application.md#gcpsqlinstancescascadingdelete) in your `nais.yaml`-specification.

!!! danger
    When you delete an Cloud SQL instance, you cannot reuse the name of the deleted instance until one week from the deletion date.

## Debugging

Check the events on the [Config Connector](https://cloud.google.com/config-connector/docs/overview) resources

```text
$ kubectl describe sqlinstance <myapp>
$ kubectl describe sqldatabase <mydb>
$ kubectl describe sqluser <myapp>
```

Check the logs of the Cloud SQL Proxy

```text
$ kubectl logs <pod> -c cloudsql-proxy
```

## Example with all configuration options

See [full example](../nais-application/example.md).

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
