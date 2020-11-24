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

## Configuration

To connect your application to the database, use information from the environment variables below.

The prefix `NAIS_DATABASE_MYAPP_MYDB` is automatically generated from the instance name `myapp` \(defaults to application name\) and `mydb` \(from database spec\). You can customize these environment variable names by setting `.spec.gcp.sqlInstances[].databases[].envVarPrefix`. For instance, setting this to `DB` will give you `DB_HOST`, `DB_USERNAME`, etc.

| key | environment variable | default |
| :--- | :--- | :--- |
| hostname | `NAIS_DATABASE_MYAPP_MYDB_HOST` | 127.0.0.1 |
| port | `NAIS_DATABASE_MYAPP_MYDB_PORT` | 5432 |
| database name | `NAIS_DATABASE_MYAPP_MYDB_DATABASE` | `.spec.gcp.sqlInstances[].databases[].name` |
| database user | `NAIS_DATABASE_MYAPP_MYDB_USERNAME` | `.spec.gcp.sqlInstances[].name` |
| database password | `NAIS_DATABASE_MYAPP_MYDB_PASSWORD` | \(randomly generated\) |
| database url with credentials | `NAIS_DATABASE_MYAPP_MYDB_URL` | `postgres://username:password@127.0.0.1:5432/mydb` |

### Cloud SQL Proxy

The application will connect to the database using [Cloud SQL Proxy](https://cloud.google.com/sql/docs/postgres/sql-proxy), ensuring that the database communication happens in secure tunnel, authenticated with automatically rotated credentials.

NAIS will add and configure the proxy client container as a sidecar in the pod, making it available on `localhost` for the application. The application will then connect to the proxy using standard database protocol just as if it was the actual database.

![sqlproxy](../assets/sqlproxy.svg)

For more detailed information, check out the [Cloud SQL Proxy documentation](https://cloud.google.com/sql/docs/postgres/sql-proxy)

### Sizing your database

By default, the database server has 1 vCPU, 614 MB RAM and 10GB of SSD storage with no automatic storage increase. If you need to change the defaults you can do this in [`nais.yaml`](../nais-application/nais.yaml/reference.md#specgcpsqlinstancesdisksize).

### Administration

The database is provisioned into the teams own project in GCP. Here the team has full access to view logs, create and restore backups and other administrative database tasks.

### Automated backup

The database is backed up nightly at 3 AM \(GMT+1\) by default, but can be overridden in [`nais.yaml`](../nais-application/nais.yaml/reference.md#specgcpsqlinstancesautobackuptime) by setting `spec.gcp.sqlInstances[].autoBackupTime`. 

Default 7 backups will be kept. More info [here](https://cloud.google.com/sql/docs/postgres/backup-recovery/backups).

The backups can be found in the [Google Cloud SQL instance](https://cloud.google.com/sql) dashboard.

### Personal database access

In order to access the database with your personal cloud user.

#### Prerequisites

When the instance is created, we need to grant the IAM users access to the "public" schema.

This can be done once in the instance like this (all IAM users are assigned the role cloudsqliamuser):
```
alter default privileges in schema public grant all on tables to cloudsqliamuser;
```

Or to a specific user like this (the IAM user must exist in the database):
```
alter default privileges in schema public grant all on tables to 'user@nav.no';
```

This can either be done by using the default application database user during database creation/migration with scripts (e.g. flyway), or as a one-time setup by using the default postgres user.

Set the password for the postgres user:
```
gcloud sql users set-password postgres \
    --instance=[INSTANCE_NAME] --prompt-for-password
```

Set up the cloudsql proxy and log in to the database (you will be prompted for the password):
```
cloudsql-proxy -instances=<project id>:<location>:<database name>=tcp:5432
psql -U postgres -h localhost -p 5432 <database name> -W
...


#### Granting temporary personal access

Create database IAM user
```
gcloud beta sql users create <firstname>.<lastname>@nav.no --instance=INSTANCE_NAME --type=cloud_iam_user
```

Create an IAM binding 
```
gcloud projects add-iam-policy-binding PROJECT_ID
    --member=user:EMAIL --role=roles/cloudsql.instanceUser --conditions ...
```

Conditions


### Deleting the database

The database is not automatically removed when deleting your NAIS application. Remove unused databases to avoid incurring unnecessary costs. This is done by setting [cascadingDelete](../nais-application/nais.yaml/reference.md#specgcpsqlinstancescascadingdelete) in your `nais.yaml`-specification.

!!! danger
    When you delete an Cloud SQL instance, you cannot reuse the name of the deleted instance until one week from the deletion date.

### Maintenance window

Google will automatically perform upgrades, fix bugs and apply security patches to prevent exploits. Your application should be able to handle occational downtime as this maintenance is performed. Read more on maintenance windows [here](https://cloud.google.com/sql/docs/postgres/maintenance). NAIS will automatically configure the maintenance window to 4 AM \(GMT+1\), but can be overridden in [`nais.yaml`](../nais-application/nais.yaml/reference.md#specgcpsqlinstances).

If you wish to be notified about upcoming maintenance, you can opt-in for this on the Communications page\([https://console.cloud.google.com/user-preferences/communication](https://console.cloud.google.com/user-preferences/communication)\) in the GCP console.

### Debugging

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

### Example with all configuration options

See [full example](../nais-application/nais.yaml/full-example.md).

