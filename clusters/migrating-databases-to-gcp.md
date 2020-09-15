## Migrating databases to GCP postgreSQL

Suggested patterns for moving on-prem databases to GCP postgreSQL.

Disclaimer: These are options for migrations to GCP postgreSQL. Others may work better for your team.

## Prerequisites
The team needs to update their ROS and PVK analysis to migrate to GCP.
Refer to the ROS and PVK section under [Google Cloud Platform clusters][GCP].

See database creation in GCP in [Google Cloud Platform persistence][DBCREATION].

## Migration paths available

### From on-premise Oracle

#### Replication migration using migration application

Create a simple migration application that supports writing data to the new database. 
Using requests sent to this application you can populate the new postgreSQL database.

Rewrite the oracle DDL scripts to postgreSQL. If your oracle database contains specific oracle procedures or functions, 
that do not exist in postgreSQL, they will have to be recreated in some other way.
There are tools available to help ease this rewrite, for example ora2pg(http://ora2pg.darold.net/start.html). 
Create the postgreSQL database in GCP and start deploy the application to GCP with the empty database 
and let flyway (or other database versioning software) create the DDLs.

Create migration app as a container in the same pod as the database application (this is to avoid permission issues using the same database). This migration application only handles the data transfer from the oracle database to postgreSQL in GCP. 
Example: [PAM AD Migration][PAMADMIGRATION]

Trigger migration from command line (or use another form of trigger) and read the data from a feed or kafka.

Pros:
- No downtime
- Live synchronization between on-premise and GCP
- Migration controlled entirely by team
- Migration can be stopped and restarted at any moment

Cons:
- Can be slow if large amounts of data are to be transferred, if this is the case use kafka for the streaming process instead
- Can be tricky for complex databases

** Note: This procedure is also valid for on-premise postgreSQL migration, and even simpler as no rewrite is necessary.
         
### From on-premise postgreSQL

#### Migration using pg_dump

This method is suitable for applications that can have the database in read-only or application that allow for some downtime.
It requires that the database instance and DDLs are created up front (i.e. deploy your application in GCP and let flyway create DDLs):

Use docker container image with psql and cloudsdk: [GCP migration image][GCPMIGRATION].

Deploy the pod into on-premise cluster that can connect to the database and exec into that pod:
```
kubectl exec -it <pod name> /bin/sh
```
Use pg_dump to create the dump file (stop writes to database before running pg_dump): 
```
pg_dump -h <postgreSQL on-premise host name> -d <database instance name> -U <database user name to connect with>  --format=plain --no-owner --no-acl --data-only -Z 9 > dump.sql.gz
```
Create GCP bucket:
```
gsutil mb gs://<bucket name> -l europe-north1
```
Set the objectAdmin role for the bucket:
```
gsutil iam ch serviceAccount:<GCP service account e-mail>:objectAdmin gs://<bucket name>/
```
Copy the dump file to GCP bucket:
```
gsutil -o GSUtil:parallel_composite_upload_threshold=150M -h "Content-Type:application/x-gzip" cp dump.sql.gz gs://<bucket name>/
```
Import the dump into the GCP postgreSQL database:
```
gcloud sql import sql <Cloud SQL instance id> gs://<bucket name>/dump.sql --database=<database instance name> --user=<database instance user name>
```
Switch loadbalancer to route to the GCP application.

Pros:
- Easy and relatively fast migration path
- No need for separate migration application or streams to populate database

Cons: 
- Requires downtime for the application, or at least no writes to database
- Requires node with access to on-premise database and GCP buckets

#### Replication migration using migration application

Same procedure as for Oracle.

#### Replication migration using pgbouncer

Not available as of now.

[GCP]: ./gcp.md
[DBCREATION]: ../persistence/postgres.md
[PAMADMIGRATION]: https://github.com/navikt/pam-ad-migration
[GCPMIGRATION]: https://github.com/navikt/gcp-migrering

