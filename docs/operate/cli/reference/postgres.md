---
tags: [command-line, reference]
---

# postgres command

The postgres command can be used to connect to a cloudsql postgres database with your personal user
It includes subcommands for granting personal access to an instance, 
setting up a cloudsql proxy, and connecting to the database using a psql shell.

All commands have the following common flags available:

| Flag      | Required | Short | Default                          | Description                                                                     |
|-----------|----------|-------|----------------------------------|---------------------------------------------------------------------------------|
| namespace | No       | -n    | namespace set in kubeconfig      | Kubernetes namespace where app is deployed                                      |
| cluster   | No       | -c    | context set in kubeconfig        | Kubernetes context where app is deployed                                        |

Note all flags has to appear before arguments (otherwise the flags will be interpreted as arguments).
So the common flags for Postgres needs to be positioned after `nais postgres <cmd>`, but before arguments:

OK ✅:
```
nais postgres prepare --context dev-gcp --namespace dreamteam appname
```

Not OK ❌:
```
nais postgres prepare appname --context dev-gcp --namespace dreamteam
```

!!! warning
    
    Run the following command first before running any of the other commands:
    
    ```
    gcloud auth login --update-adc
    ```

## prepare
Prepare will prepare the postgres instance by connecting using the
application credentials and by default modify the permissions on the public schema.
All IAM users in your GCP project will be able to connect to the instance.

This operation is only required to run once for each postgresql instance and schema.

```bash
nais postgres prepare appname
```

| Argument    | Required  | Description                                                 |
|-------------|-----------|-------------------------------------------------------------|
| appname     | Yes       | Name of application owning the database                     |

| Flag      | Required | Short |Default                       |Description                                              |
|-----------|----------|-------|------------------------------|---------------------------------------------------------|
| all-privs | No       |       | false                        | If true `ALL` is granted, else only `SELECT` is granted |
| schema    | No       |       | public                       | Name of the schema to grant access to                   |

## revoke
Revokes the privileges given to the role cloudsqliamuser in the given schema (default `public`).
Does not remove access for users to log in to the database or the `roles/cloudsql.admin` given to the user in GCP console.

This operation is only required to run once for each postgresql instance.

```bash
nais postgres revoke appname
```

| Argument    | Required  | Description                                                 |
|-------------|-----------|-------------------------------------------------------------|
| appname     | Yes       | Name of application owning the database                     |

| Flag      | Required | Short |Default |Description                               |
|-----------|----------|-------|--------|------------------------------------------|
| schema    | No       |       | public | Name of the schema to revoke access from |

## grant
Grant yourself access to a Postgres database.

This is done by temporarily adding your user to the list of users that can administrate Cloud SQL instances and creating a database user with your email.

This operation is only required to run once for each postgresql database.

```bash
nais postgres grant appname
```

| Argument    | Required  | Description                                                 |
|-------------|-----------|-------------------------------------------------------------|
| appname     | Yes       | Name of application owning the database                     |

## proxy
Update IAM policies by giving your user a timed sql.cloudsql.instanceUser role, then start a proxy to the instance.

```bash
nais postgres proxy appname
```

| Argument    | Required  | Description                                                 |
|-------------|-----------|-------------------------------------------------------------|
| appname     | Yes       | Name of application owning the database                     |

| Flag      | Required | Short |Default                       |Description                                  |
|-----------|----------|-------|------------------------------|---------------------------------------------|
| port      | No       | -p    | 5432                         | Local port for cloudsql proxy to listen on  |
| host      | No       | -H    | localhost                    | Host for the proxy                          |

> **Note**
> When using proxy to connect to the database, the auth method is username and password.
> The username is your full Google account email: e.g. `ola.bruker@nais.io`, and password is blank.

## psql
Create a shell to the postgres instance by opening a proxy on a random port (see the proxy command for more info) and opening a psql shell.

```bash
nais postgres psql appname
```

| Argument    | Required  | Description                                                 |
|-------------|-----------|-------------------------------------------------------------|
| appname     | Yes       | Name of application owning the database                     |

| Flag      | Required | Short |Default                       |Description                                  |
|-----------|----------|-------|------------------------------|---------------------------------------------|
| verbose   | No       | -V    | false                        | Verbose will print proxy log                |

## users add
Adds a user to the database
By default the user is granted select privileges to the database public schema
The privilege level can be altered with the `--privilege` flag.

```bash
nais postgres users add appname username password
```

| Argument    | Required  | Description                                                 |
|-------------|-----------|-------------------------------------------------------------|
| username    | Yes       | Name of the new database user                               |
| password    | Yes       | Password for the new database user                          |
| appname     | Yes       | Name of application owning the database                     |

| Flag      | Required | Short |Default                       |Description                                  |
|-----------|----------|-------|------------------------------|---------------------------------------------|
| privilege | No       |       | select                       | The privilege level the user is granted     |

## users list
Lists all users in a database.

```bash
nais postgres users list appname
```

| Argument    | Required  | Description                                                 |
|-------------|-----------|-------------------------------------------------------------|
| appname     | Yes       | Name of application owning the database                     |

## password rotate
Rotate the Postgres database password, both in GCP and in the Kubernetes secret.

```bash
nais postgres password rotate appname
```

| Argument    | Required  | Description                                                 |
|-------------|-----------|-------------------------------------------------------------|
| appname     | Yes       | Name of application owning the database                     |


## migrate 

!!! info "Status: Beta"
    
    We believe that migration works as intended, but it needs a broader audience to be battle-tested properly.
    Please report any issues to the #nais channel on Slack.

Commands used for migrating to a new postgres instance.

See also [Migrating to a new SQLInstance](../../../persistence/postgres/how-to/migrate-to-new-instance.md)

All the `migrate` subcommands require the following arguments:

| Argument          | Required | Description                                     |
|-------------------|----------|-------------------------------------------------|
| appname           | Yes      | Name of application owning the database         |
| new-instance-name | Yes      | Name of the new postgres instance to migrate to |

### migrate setup

Setup will create a new (target) instance with updated configuration, and enable continuous replication of data from the source instance.

```bash
nais postgres migrate setup appname new-instance-name
```

Setup supports the following optional flags:

| Flag      | Description                                                                                                                     |
|-----------|---------------------------------------------------------------------------------------------------------------------------------|
| tier      | Tier of new instance. See [Postgres reference](../../../persistence/postgres/reference/README.md#server-size).                  |
| type      | Postgres version of new instance. See [Postgres reference](../../../persistence/postgres/reference/README.md#postgres-version). |
| disk-size | Disk size of new instance.                                                                                                      |

These flags must be specified before arguments, e.g:

```bash
nais postgres migrate setup --tier $TIER --type $TYPE --disk-size $DISK_SIZE appname new-instance-name
```

### migrate promote

Promote will promote the target instance to the new primary instance, and update the application to use the new instance.

```bash
nais postgres migrate promote appname new-instance-name
```

### migrate finalize

Finalize will remove the source instance and associated resources after a successful migration.

```bash
nais postgres migrate finalize appname new-instance-name
```

### migrate rollback

Rollback will roll back the migration, and restore the application to use the original instance.

```bash
nais postgres migrate rollback appname new-instance-name
```
