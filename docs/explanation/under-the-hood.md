# Under the hood
In this explanation, we will go through some of the underlying technologies we use to provide NAIS.

## Environment

### Runtime implementation
Each environment is its own [Kubernetes](https://kubernetes.io) cluster using [GKE](https://cloud.google.com/kubernetes-engine?hl=en).
Inside each environment, every team has their own [namespace](https://kubernetes.io/docs/concepts/overview/working-with-objects/namespaces/), which is only accessible by the members of the team.

### Workload isolation
All workloads are deployed in a team namespace and every workload is isolated from _all_ other workloads by utilizing [Kubernetes network policies](https://kubernetes.io/docs/concepts/services-networking/network-policies/) unless [explicitly allowed](./zero-trust.md).

## GCP resources (CloudSQL, Cloud Storage, BigQuery, etc.)
When resources, such as a database, is requested, it is provisioned in a separate GCP project that is dedicated to _this_ team for _this_ environment.
As with the team's namespace, the team's project is only accessible by the members of the team.

Example NAIS environment:
```mermaid
graph LR
subgraph GCP
    subgraph NAIS-dev cluster
    subgraph team-a-ns[Team A namespace]
      team-a-app[App A]
    end

    subgraph team-b-ns[Team B namespace]
      team-b-app[App B]
    end

    subgraph team-c-ns[Team C namespace]
      team-c-app[App C]
    end
  end

    subgraph team-a-project[A-dev project]
      team-a-db[Database A]
    end

    subgraph team-b-project[B-dev project]
      team-b-db[Database B]
    end

    subgraph team-c-project[C-dev project]
      team-c-db[Database C]
    end
end

team-a-app --> team-a-db
team-b-app --> team-b-db
team-c-app --> team-c-db
```

In the example above, we have three teams, `A`, `B` and `C`.
Each team has their own namespace in the `dev` cluster, and when they request a database, it is provisioned in their own `team-dev` project.