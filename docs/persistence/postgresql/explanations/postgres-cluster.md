---
tags: [postgres, sql, explanation, cluster]
---

# Postgres cluster 

!!! warning "Experimental feature"
    This feature is an alpha feature, and is subject to API change, instability or removal.
    See the [main Postgres page](../README.md) for more information.

Postgres is a managed database cluster provided by nais utilizing the Zalando postgres-operator.

You manage your cluster by defining it in your [application manifest](../../../workloads/application/reference/application-spec.md#postgres).

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
      name: my-cluster
      majorVersion: "17"
      resources:
        cpu: 100m
        diskSize: 10Gi
        memory: 2G
```

In nais, an Application can only have one postgres cluster, with one application database in the instances.
We believe that an application should not need more than one database. 
If you have a need for more than one database, you should consider splitting your application into multiple applications. 

Creation of the postgres cluster will take a few minutes.

## Attributes of a postgres cluster

### Networking

Postgres cluster instances are created within the teams postgres namespace, ensuring that database communication never leaves the Kubernetes cluster network.
Additionally, network policies are applied to ensure that only the application that owns the cluster can access it, in addition to nais platform components.

### Disks

Clusters will be created with SSD disks, and the user is required to specify the disk size in the `nais.yaml` file.

## Making changes to a postgres cluster

All changes to your cluster is done by modifying the `nais.yaml` file and redeploying your application.
Most changes will be applied to your cluster with virtually no downtime.
The operator will handle the changes and apply them to the cluster instances in a rolling fashion, ensuring that your application remains available.

Some of these changes can not be undone, such as changing the major version or increasing disk size.

### Migrating your application to a new postgres cluster

When migrating from one postgres cluster to another, you will need to create a new cluster and migrate your application to the new instance.
This can be done by exporting the data from the old cluster and importing it into the new cluster. 
The postgres operator also supports cloning clusters from a backup which is fairly easy, but we recommend contacting the nais team for assistance with this.

{#TODO: Add link and information on how to migrate to new instance#}
