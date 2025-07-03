---
tags: [explanation, persistence, services, experimental]
---

# PostgreSQL

!!! warning "Experimental feature"
    This feature is an alpha feature, and is subject to API change, instability or removal.
    Some features may not be fully developed, and changes will be made in the coming months.
    If this is not what you want, you probably want to use [Cloud SQL](../cloudsql/README.md) instead.
    
        Notable missing features include:
    
        - Audit logging
        - Automatic storage increase
        - Disaster recovery backups to separate location
        - Query Insights
    
    
[PostgreSQL](https://www.postgresql.org/) is a relational database which is a good choice for storing data that is relational in nature.
In the nais platform, we support zalando postgres-operator to provision managed PostgreSQL databases.

Minimal configuration needed to provision a database for your application:

```yaml title="app.yaml"
...
apiVersion: nais.io/v1alpha1
kind: Application
metadata:
  name: myapp
...
spec:
  ...
  postgres:
    cluster:
      majorVersion: "17"
      resources:
        cpu: 100m
        diskSize: 1Gi
        memory: 2G
```

The default configuration sets up the [cluster](explanations/postgres-cluster.md) with:

- no automatic storage increase
- primary and replica (in production we recommend using high availability which offers a primary and two replicas)
- automatic backups

See all configuration options in the [application manifest reference](../../workloads/application/reference/application-spec.md#postgres).

!!! warning "Choosing the right resources for production"

    The minimal configuration above creates a database cluster with limited resources. 
    Change these resources to suit your purposes for your production databases.

    Please also note that automatic storage increase is not currently available.

## How it works

The first time you deploy your application with the above configuration, Nais will provision the database into your team's postgres namespace (team namespace prefixed with pg-).
Your team has full access to view logs and perform administrative database tasks and maintenance.

Nais also configures your application with the necessary environment variables needed to connect to the database.
See the [reference](reference/README.md#database-connection) for the list of environment variables.

First time provisioning of the database will take a few minutes.
Your application will not be able to connect to the database until the provisioning is complete.
