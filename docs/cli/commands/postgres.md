# postgres command
The postgres command can be used to connect to a cloudsql postgres database with your personal user. It includes subcommands for granting personal access to an instance, 
setting up a cloudsql proxy, and connecting to the database using a psql shell.

## prepare
Prepare will prepare the postgres instance by connecting using the
application credentials and modify the permissions on the public schema.
All IAM users in your GCP project will be able to connect to the instance.

This operation is only required to run once for each postgresql instance.

```bash
nais postgres prepare appname
```

| Argument    | Required  | Description                                                 |
|-------------|-----------|-------------------------------------------------------------|
| appname     | Yes       | Name of application owning the database                     |

| Flag      | Required | Short |Default                       |Description                                  |
|-----------|----------|-------|------------------------------|---------------------------------------------|
| namespace | No       | -n    | namespace set in kubeconfig  | Kubernetes namespace where app is deployed  |
| cluster   | No       | -c    | context set in kubeconfig    | Kubernetes context where app is deployed    |

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

| Flag      | Required | Short |Default                       |Description                                  |
|-----------|----------|-------|------------------------------|---------------------------------------------|
| namespace | No       | -n    | namespace set in kubeconfig  | Kubernetes namespace where app is deployed  |
| cluster   | No       | -c    | context set in kubeconfig    | Kubernetes context where app is deployed    |

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
| namespace | No       | -n    | namespace set in kubeconfig  | Kubernetes namespace where app is deployed  |
| cluster   | No       | -c    | context set in kubeconfig    | Kubernetes context where app is deployed    |
| port      | No       | -p    | 5432                         | Local port for cloudsql proxy to listen on  |
| host      | No       | -H    | localhost                    | Host for the proxy                          |

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
| namespace | No       | -n    | namespace set in kubeconfig  | Kubernetes namespace where app is deployed  |
| cluster   | No       | -c    | context set in kubeconfig    | Kubernetes context where app is deployed    |
| verbose   | No       | -V    | false                        | Verbose will print proxy log                |

## users add
Adds a user to the database. By default the user is granted select privileges to the database public schema. The privilege level can be altered with the `--privilege` flag.

```bash
nais postgres users add username password appname
```

| Argument    | Required  | Description                                                 |
|-------------|-----------|-------------------------------------------------------------|
| username    | Yes       | Name of the new database user                               |
| password    | Yes       | Password for the new database user                          |
| appname     | Yes       | Name of application owning the database                     |

| Flag      | Required | Short |Default                       |Description                                  |
|-----------|----------|-------|------------------------------|---------------------------------------------|
| namespace | No       | -n    | namespace set in kubeconfig  | Kubernetes namespace where app is deployed  |
| cluster   | No       | -c    | context set in kubeconfig    | Kubernetes context where app is deployed    |
| privilege | No       |       | select                       | The privilege level the user is granted     |

## users list
Lists all users in a database.

```bash
nais postgres users list appname
```

| Argument    | Required  | Description                                                 |
|-------------|-----------|-------------------------------------------------------------|
| appname     | Yes       | Name of application owning the database                     |

| Flag      | Required | Short |Default                       |Description                                  |
|-----------|----------|-------|------------------------------|---------------------------------------------|
| namespace | No       | -n    | namespace set in kubeconfig  | Kubernetes namespace where app is deployed  |
| cluster   | No       | -c    | context set in kubeconfig    | Kubernetes context where app is deployed    |
