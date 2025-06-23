---
title: Cloud SQL Instance
tags: [postgres, cloudsql, cloud, sql, explanation, sqlinstance]
---

# Cloud SQL Instance

A Cloud SQL instance is a managed database server provided by Google Cloud Platform.
In nais, these are used to provide PostgreSQL databases for your applications.

You manage your Cloud SQL instance by defining it in your [application manifest](../../../workloads/application/reference/application-spec.md#gcpsqlinstances).

```yaml title="app.yaml"
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
      - type: POSTGRES_16
        tier: db-f1-micro
        databases:
          - name: mydb
```

A Cloud SQL Instance can have more than one database, but in nais we have decided to limit it to one database per instance.

In nais, an Application can only have one SQL Instance. 
We believe that an application should not need more than one database. 
If you have a need for more than one database, you should consider splitting your application into multiple applications. 

Creation of an SQL Instance can take some time, often as much as 8-10 minutes.
When first deploying an application with an SQL Instance, this can cause the deployment to time out.

## Attributes of an SQL Instance

### Machine type

SQL Instances are sized by the tier.
Tier are predefined configurations of CPU and memory. 
See the [reference](../reference/README.md#server-size) for possible tiers.

The tier you select also influence other properties of the instance, such as max number of connections.

### Networking

SQL Instances are created with a private IP address, ensuring that database communication never leaves the Google Cloud network.

Prior to 2024-04-18, SQL Instances were created with a single public IP address, and required using [Cloud SQL Proxy](https://cloud.google.com/sql/docs/postgres/sql-proxy) to connect.
Cloud SQL proxy ensures that the database communication over the open internet happened in a secure tunnel, authenticated with automatically rotated credentials.

By using private IP, you can avoid the need for Cloud SQL Proxy, and connect directly to the database from your application.

### Disks

SQL Instances are created with a default disk size of 10 GB.
If you need more, you can increase the disk size in the `app.yaml` file.

SSD disks are the default.
You can use HDD disks if you wish to reduce cost a bit.

Consult the [Google documentation for details](https://cloud.google.com/sql/docs/postgres/choosing-ssd-hdd).

## Making changes to an SQL Instance

Most changes you wish to do to your SQL Instance can be done by modifying the `app.yaml` file and redeploying your application.
Simple changes will be applied to your SQL Instance with virtually no downtime, but other changes may take longer.

Some of these changes can not be undone, such are changing the major version of PostgreSQL or increasing disk size.

There are also some changes that can not be done without creating a new SQL Instance.

Some changes that will work, but require a non-trivial amount of downtime:

* [Changing the tier](../how-to/change-tier.md)
* [Upgrade major version](../how-to/upgrade-postgres.md)

Most other changes will require a restart of the SQL Instance, which typically takes less than a minute.

Changes that can not be done without creating a new SQL Instance:

* Switching from Cloud SQL Proxy to private IP
* Reducing disk size

### Migrating your application to a new SQL Instance

Use cases where migrating to a new SQL instances may be preferable or required:

* Upgrading to a new major version of PostgreSQL with an option to roll back to the previous version.
* Reducing disk size.
* Switching from Cloud SQL Proxy to private IP.

Learn [how to create a new SQL Instance and migrate your application](../how-to/migrate-to-new-instance.md).
