# Clusters

A cluster is the place where your application will run. NAIS uses Kubernetes to run applications. Kubernetes is a container orchestration system, which means that it will manage the containers that your application runs in.

There are two types of clusters available for you to deploy to:

* `<env>-gcp` - Google Cloud Platform
* `<env>-fss` - On-premises

Each cluster type has a development and a production environment (denoted as `<env>` in the list above). Development environments are used for testing and development, while production environments are used for production.

| Cluster | Environment | Purpose |
| --- | --- | --- |
| `dev-gcp` | Development | Development and testing of new applications |
| `prod-gcp` | Production | Production applications |
| `dev-fss` | Development | Development and testing of new applications |
| `prod-fss` | Production | Production applications |

In addition to the clusters listed above, there is a special cluster called `labs-gcp` which is used for experimentation and testing of new features.

## Team Namespaces

Each team has its own namespace in each cluster. The namespace name is the same as the team name, and is used to group applications bellowing to one team together.

[:octicons-arrow-right-24: Read more about team namespaces](./team-namespaces.md)

## Service Discovery

Applications in a cluster can talk with each other using the name of the application as the hostname. This is called service discovery in Kubernetes.

Within a namespace, you can use the short name of the application (`http://<application>`). If you want to talk to an application from another team, you must specify that after the application name (`http://<application>.<team>`).

[:octicons-arrow-right-24: Read more about service discovery](./service-discovery.md)

## Google Cloud Platform (GCP)

NAIS recommends that you deploy your applications to the GCP cluster for improved performance, reliability and new features. GCP should be considered the default cluster for any new applications.

[:octicons-arrow-right-24: Read more about the GCP cluster](./gcp.md)

### Migrate to GCP

For teams with existing applications on-prem, we recommend that you migrate to GCP. This will give you access to new features and improved performance. We have a [migration guide](./migrate-to-gcp.md) to help you get started.

[:octicons-arrow-right-24: Read more about migrating to GCP](./migrating-to-gcp.md)

[:octicons-arrow-right-24: Read more about migrating databases to GCP](./migrating-databases-to-gcp.md)
