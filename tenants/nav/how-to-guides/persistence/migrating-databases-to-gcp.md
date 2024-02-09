# Migrating databases to GCP

## Migrating databases to GCP postgreSQL

Suggested patterns for moving on-prem databases to GCP postgreSQL.

Disclaimer: These are options for migrations to GCP postgreSQL. Others may work better for your team.

## Prerequisites

The team needs to update their ROS and PVK analysis to migrate to GCP. Refer to the ROS and PVK section under [Google Cloud Platform clusters](gcp.md).

See database creation in GCP in [Google Cloud Platform persistence](../persistence/postgres.md).

## Migration paths available

### From on-premise Oracle

#### Replication migration using migration application

Create a simple migration application that supports writing data to the new database. Using requests sent to this application you can populate the new postgreSQL database.

Rewrite the oracle DDL scripts to postgreSQL. If your oracle database contains specific oracle procedures or functions, that do not exist in postgreSQL, they will have to be recreated in some other way. There are tools available to help ease this rewrite, for example [ora2pg](http://ora2pg.darold.net/start.html). Create the postgreSQL database in GCP and start deploy the application to GCP with the empty database and let flyway \(or other database versioning software\) create the DDLs.

Create migration app as a container in the same pod as the database application \(this is to avoid permission issues using the same database\). This migration application only handles the data transfer from the oracle database to postgreSQL in GCP.

Examples:

* [PAM Stillingsregistrering API Migration](https://github.com/navikt/pam-stillingsregistrering-api-migration/#pam-stillingsregistrering-api-migration) (documentation and code)
* [PAM AD Migration](https://github.com/navikt/pam-ad-migration) (no documentation, just code)
* [Rekrutteringsbistand migration](https://github.com/navikt/rekrutteringsbistand-kandidat-api-migrering)  (not using JPA for easier code and less memory-intensive data handling, but as-is only suitable on-premise migration)

Trigger migration from command line \(or use another form of trigger\) and read the data from a feed or kafka.

Pros:

* No downtime
* Live synchronization between on-premise and GCP
* Migration controlled entirely by team
* Migration can be stopped and restarted at any moment

Cons:

* Can be slow if large amounts of data are to be transferred, if this is the case use kafka for the streaming process instead
* Can be tricky for complex databases

!!! note
    This procedure is also valid for on-premise postgreSQL migration, and even simpler as no rewrite is necessary.

### From on-premise postgreSQL

#### Migration using pg\_dump

This method is suitable for applications that can have the database in read-only or application that allow for some downtime. It requires that the database instance and DDLs are created up front \(i.e. deploy your application in GCP and let flyway create DDLs\):

Use docker container image with psql and cloudsdk: [GCP migration image](https://github.com/navikt/gcp-migrering). This image let you do all the following actions from one place. You can either use the manual described below or the migration_data.sh script in the repository.

In any case you need to create a secret in your namespace containing the Google SA you want to use to do the migration. Add the token to the secret.yaml file and apply it in your namespace.

Deploy the pod into on-premise cluster that can connect to the database

```shell
kubectl apply -f https://raw.githubusercontent.com/navikt/gcp-migrering/main/gcloud.yaml
```

`exec` into that pod

```shell
kubectl exec -it gcloud -- /bin/bash
```

Log in to gcloud with your own NAV-account

```shell
gcloud auth login
```

Configure the project id \(find project id with `gcloud projects list --filter team`\)

```shell
gcloud config set project <project id>
```

Create a GCP bucket. You will need the `roles/storage.admin` IAM role for the required operations on the bucket.

```shell
gsutil mb -l europe-north1 gs://<bucket name>
```

Find the GCP service account e-mail \(the instance id is specified in your `nais.yaml` file\)

```shell
gcloud sql instances describe <CloudSQL instance id> | yq r - serviceAccountEmailAddress
```

Set the objectAdmin role for the bucket \(with the previous e-mail\)

```shell
gsutil iam ch serviceAccount:<GCP service account e-mail>:objectAdmin gs://<bucket name>/
```

Use `pg_dump` to create the dump file. Notes:

- Make sure that you stop writes to database before running `pg_dump`.
- Get a [database user from Vault](https://github.com/navikt/utvikling/blob/main/docs/teknisk/Vault.md#--hente-ut-postgresql-credentials-til-en-utvikler).
- If the database in GCP already has the `flyway_schema_history` table, 
  you might want to exclude the equivalent table in the dump by using the `--exclude-table=flyway_schema_history` option.

```shell
pg_dump \
  -h <postgreSQL on-premise host name> \
  -d <database instance name> \
  -U <database user name to connect with> \
  --format=plain --no-owner --no-acl --data-only -Z 9 > dump.sql.gz
```

Copy the dump file to GCP bucket

```shell
gsutil -o GSUtil:parallel_composite_upload_threshold=150M -h "Content-Type:application/x-gzip" cp dump.sql.gz gs://<bucket name>/
```

Import the dump into the GCP postgreSQL database. Notes:

- You need the `roles/cloudsql.admin` IAM role in order to perform the import.
- The `user` in the command below should be a GCP SQL Instance user.
- If the GCP Postgres database has any existing tables or sequences, make sure that the `user` has all required grants for these.

```shell
gcloud sql import sql <Cloud SQL instance id> gs://<bucket name>/dump.sql.gz \
  --database=<database instance name> \
  --user=<database instance user name>
```

Verify that the application is behaving as expected and that the data in the new database is correct. Finally we need to switch loadbalancer to route to the GCP application instead of the on-premise equivalent.

Delete the bucket in GCP after migration is complete

```shell
gsutil -m rm -r gs://<bucket name>
gsutil rb gs://<bucket name>
```

Pros:

* Easy and relatively fast migration path
* No need for separate migration application or streams to populate database

Cons:

* Requires downtime for the application, or at least no writes to database
* Requires node with access to on-premise database and GCP buckets

#### Replication migration using migration application

Same procedure as for Oracle.

#### Replication migration using pgbouncer

Not available as of now.

