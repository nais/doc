# Postgres

You can provision and configure [Postgres](https://www.postgresql.org/) through [`nais.yaml`](../nais-application/nais.yaml/reference.md).

!!! warning
    If you change the postgreSQL version your data will be lost, as a new database will be created.
    In other words to upgrade the database version you will need to do a migration as described here: [Upgrade GCP postgreSQL](https://cloud.google.com/sql/docs/postgres/upgrade-db)

When you deploy your application with database config, NAIS will ensure the database exists in a [Google Cloud SQL instance](https://cloud.google.com/sql) with the specified [Postgres](https://cloud.google.com/sql/docs/postgres/) version, and configure the application with means to connect to it.

!!! info
    This feature is only available in GCP clusters. If you need on-prem databases, head over to [navikt/database-iac](https://github.com/navikt/database-iac).

Below is an example of the minimal configuration needed. See all configuration options in the [nais.yaml reference](../nais-application/nais.yaml/reference.md#specgcpsqlinstances).

```yaml
...
kind: Application
metadata:
  name: myapp
spec:
  gcp:
    sqlInstances:
      - type: POSTGRES_12
        databases:
          - name: mydb
```

### Maintenance window

Google will automatically perform upgrades, fix bugs and apply security patches to prevent exploits. Your application should be able to handle occasional downtime as this maintenance is performed. Read more on maintenance windows [here](https://cloud.google.com/sql/docs/postgres/maintenance). NAIS does not configure the maintenance window, but this can be set up in the application spec: [`nais.yaml`](../nais-application/nais.yaml/reference.md#specgcpsqlinstances).

If you wish to be notified about upcoming maintenance, you can opt-in for this on the [Communications page](https://console.cloud.google.com/user-preferences/communication) in the GCP console.

## Configuration

To connect your application to the database, use information from the environment variables below.

The prefix `NAIS_DATABASE_MYAPP_MYDB` is automatically generated from the instance name `myapp` \(defaults to application name\) and `mydb` \(from database spec\). You can customize these environment variable names by setting `.spec.gcp.sqlInstances[].databases[].envVarPrefix`. For instance, setting this to `DB` will give you `DB_HOST`, `DB_USERNAME`, etc. Note that changing or adding `envVarPrefix` requires you to manually delete the `google-sql-<MYAPP>` secret, see below.

| key | environment variable | default |
| :--- | :--- | :--- |
| hostname | `NAIS_DATABASE_MYAPP_MYDB_HOST` | 127.0.0.1 |
| port | `NAIS_DATABASE_MYAPP_MYDB_PORT` | 5432 |
| database name | `NAIS_DATABASE_MYAPP_MYDB_DATABASE` | `.spec.gcp.sqlInstances[].databases[].name` |
| database user | `NAIS_DATABASE_MYAPP_MYDB_USERNAME` | `.spec.gcp.sqlInstances[].name` |
| database password | `NAIS_DATABASE_MYAPP_MYDB_PASSWORD` | \(randomly generated\) |
| database url with credentials | `NAIS_DATABASE_MYAPP_MYDB_URL` | `postgres://username:password@127.0.0.1:5432/mydb` |
 
!!! info
    The application is the only application that can access the database instance. Other applications can not connect. It is not, for instance,
    possible to have two applications (e.g. producer and consumer) connecting directly to the database.
    
!!! info 
    Note that if you have deployed your application with one configuration, and then change it later, you have to manually delete the google-sql-*MYAPP* secret before you make a new deploy:
```bash
$ kubectl delete secret google-sql-<MYAPP>
```

## Cloud SQL Proxy

The application will connect to the database using [Cloud SQL Proxy](https://cloud.google.com/sql/docs/postgres/sql-proxy), ensuring that the database communication happens in secure tunnel, authenticated with automatically rotated credentials.

NAIS will add and configure the proxy client container as a sidecar in the pod, making it available on `localhost` for the application. The application will then connect to the proxy using standard database protocol just as if it was the actual database.

![sqlproxy](../assets/sqlproxy.svg)

For more detailed information, check out the [Cloud SQL Proxy documentation](https://cloud.google.com/sql/docs/postgres/sql-proxy)

## Sizing your database

By default, the database server has 1 vCPU, 614 MB RAM and 10GB of SSD storage with no automatic storage increase. If you need to change the defaults you can do this in [`nais.yaml`](../nais-application/nais.yaml/reference.md#specgcpsqlinstancesdisksize).

## Administration

The database is provisioned into the teams own project in GCP. Here the team has full access to view logs, create and restore backups and other administrative database tasks.

## Automated backup

The database is backed up nightly at 3 AM \(GMT+1\) by default, but can be overridden in [`nais.yaml`](../nais-application/nais.yaml/reference.md#specgcpsqlinstancesautobackuptime) by setting `spec.gcp.sqlInstances[].autoBackupTime`. 

Default 7 backups will be kept. More info [here](https://cloud.google.com/sql/docs/postgres/backup-recovery/backups).

The backups can be found in the [Google Cloud SQL instance](https://cloud.google.com/sql) dashboard.

## Additional user(s) database(s)

You can add users to your database by setting database configuration option: `.spec.gcp.sqlInstances[].databases[].users`. 
Names added must match regex: `^[_a-zA-Z][_a-zA-Z0-9]+$`. Secrets is generated and mounted for each user.
With `.spec.gcp.sqlInstances[].databases[].envVarPrefix` set to `DB` and additional username to `_user2` you will get environment variables in format `DB_USER2_MYDB_USERNAME` etc. Details about environment variables is specified her: [`configuration`](../persistence/postgres.md#configuration)

!!! info
Note that if you have deployed your application a user, and then change name or remove the user from configuration, you have to manually delete the google-sql-*MYAPP*-*USER*:
```bash
$ kubectl delete secret google-sql-<MYAPP>-<USER>
```

## Personal database access

Databases should always be accessed using a personal account, and the access should ideally be temporary.

### Prerequisites

???+ check "Step 1. Install local binaries"

    This guide assumes that you have the following installed on your local machine:

    - [cloudsql-proxy binary](https://cloud.google.com/sql/docs/postgres/sql-proxy#install)
    - [psql binary](https://blog.timescale.com/tutorials/how-to-install-psql-on-mac-ubuntu-debian-windows/)

???+ check "Step 2. Allow your user to edit Cloud SQL resources for your project"
    Ensure that you have authenticated `gcloud` by running

    ```bash
    gcloud auth login
    ```

    To be able to perform the gcloud commands mentioned below you need a role with user edit permissions, e.g. `roles/cloudsql.editor`

    To grant yourself this role for a given project, run the following command: 

    ```bash
    gcloud projects add-iam-policy-binding <project-id> \
        --member user:<your-email> \
        --role roles/cloudsql.editor
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

???+ check "Step 3c. Enable privileges for user(s) in database"

    This can be enabled for all `cloudsqliamusers` (all IAM users are assigned the role `cloudsqliamuser`) with the following command: 
   
    ```sql
    alter default privileges in schema public grant all on tables to cloudsqliamuser;
    ```

    Or for a specific user (the given IAM user must exist in the database):

    ```sql
    alter default privileges in schema public grant all on tables to 'user@nav.no';
    ```

### Granting temporary personal access

???+ check "Step 1. Create database IAM user"

    This is required once per user and requires that you have create user permission in IAM in your project, e.g. Cloud SQL Admin.

    To grant yourself this role for a given project, run the following command: 

    ```bash
    gcloud projects add-iam-policy-binding <project-id> \
        --member user:<your-email> \
        --role roles/cloudsql.admin
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

## Deleting the database

The database is not automatically removed when deleting your NAIS application. Remove unused databases to avoid incurring unnecessary costs. This is done by setting [cascadingDelete](../nais-application/nais.yaml/reference.md#specgcpsqlinstancescascadingdelete) in your `nais.yaml`-specification.

!!! danger
    When you delete an Cloud SQL instance, you cannot reuse the name of the deleted instance until one week from the deletion date.

## Disaster backup

In case of catastrophic failure in GCP we are running a daily complete backup of the postgresql databases in GCP to an on-prem location. This backup currently runs at 5 am. This is in addition to the regular backups in GCP.

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

See [full example](../nais-application/nais.yaml/full-example.md).

