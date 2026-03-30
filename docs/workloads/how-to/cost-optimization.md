---
tags: [workloads, how-to, cost]
---

# Reduce costs

Most teams can cut their GCP costs with a few changes to their `nais.yaml` manifests. The largest savings come from right-sizing database instances, adjusting resource requests, and tuning replica counts.

## Find what to optimize

Before making changes, check your team's current resource usage and costs in [Nais Console :octicons-link-external-16:](<<tenant_url("console")>>):

- **Cost** — daily costs broken down by GCP service. Find it under your team's **Cost** tab.
- **Utilization** — CPU and memory requested vs. actually used, per workload. Find it under your team's **Utilization** tab.

The Utilization page shows how much you request and how much you use. The gap between these numbers is what you're overpaying for.

## Resource requests

### Lower CPU requests

Kubernetes lets pods burst beyond their CPU request when the node has spare capacity. By removing the CPU limit and setting the request to the application's idle baseline, you pay for less without losing burst capacity.

Set the CPU request to the idle baseline (what your app uses during nights and weekends):

```yaml title="app.yaml" hl_lines="4"
spec:
  resources:
    requests:
      cpu: 20m
      memory: 256Mi
```

Typical values:

| Application type            | CPU request (prod) | CPU request (dev) |
| :-------------------------- | :----------------- | :---------------- |
| Frontend                    | 20m                | 10m               |
| Backend (Ktor, Spring Boot) | 30m                | 10m               |

!!! info
    Don't set a CPU limit. Removing it lets the application burst freely when it needs more CPU, without paying for reserved capacity it rarely uses.

!!! warning
    Don't go below your application's actual baseline. When nodes are busy, each pod only gets CPU proportional to its request. Too-low requests cause slow responses, failed health checks, and pod restarts. They also make the autoscaler flap, since even minor CPU usage exceeds the 50% scaling threshold.

### Lower memory requests

Memory requests reserve capacity on the node, just like CPU. If your application requests 512 Mi but uses 200 Mi, the remaining 312 Mi is wasted — no other pod can use it.

Check actual memory usage in the **Utilization** tab in [Nais Console :octicons-link-external-16:](<<tenant_url("console")>>), then set the request to match the observed peak with some headroom:

```yaml title="app.yaml" hl_lines="5"
spec:
  resources:
    requests:
      cpu: 20m
      memory: 256Mi
```

!!! warning
    If a pod exceeds its memory request and the node is under pressure, it may be evicted. Leave some margin above the observed peak.

## Replicas

### Reduce minimum replicas in dev

The default minimum is 2 replicas. Dev environments that don't need high availability can run with 1:

```yaml title="app.yaml" hl_lines="3"
spec:
  replicas:
    min: 1
    max: 2
```

This halves the base cost for that workload in dev.

### Lower maximum replicas

The default maximum is 4 replicas. If your application handles its load with fewer, lower the max to prevent unnecessary scaling:

```yaml title="app.yaml" hl_lines="4"
spec:
  replicas:
    min: 2
    max: 3
```

See the [automatic scaling reference](../application/reference/automatic-scaling.md) for details on scaling thresholds and strategies.

## Database tier

Database instances are often the largest line item on the Cost page.

### Use a smaller tier in dev

Dev databases rarely need production-grade hardware. Switch to the smallest available tier:

```yaml title="app.yaml" hl_lines="5"
spec:
  gcp:
    sqlInstances:
      - type: POSTGRES_17
        tier: db-f1-micro
        databases:
          - name: mydb
```

!!! warning
    `db-f1-micro` does not have an SLA. This is fine for dev, but not for production.

### Right-size your production database

Check your database's CPU usage in the [Google Cloud Console :octicons-link-external-16:](https://console.cloud.google.com/sql/instances) or through [database observability tools](../../persistence/cloudsql/how-to/database-observability.md).

If CPU usage stays low, lower the tier. The smallest tier with an SLA is `db-custom-1-3840`:

```yaml title="app.yaml" hl_lines="5"
spec:
  gcp:
    sqlInstances:
      - type: POSTGRES_17
        tier: db-custom-1-3840
        databases:
          - name: mydb
```

See the [full list of available tiers](../../persistence/cloudsql/reference/README.md#server-size).

!!! warning
    Changing the tier restarts the database, causing a few minutes of downtime.

### Fix slow queries instead of scaling up

High CPU usage often comes from missing indexes or expensive queries, not actual load. Before upgrading the tier, check for these using [Query Insights :octicons-link-external-16:](https://console.cloud.google.com/sql/instances) in the Google Cloud Console.

### Evaluate high availability settings

If your database has `highAvailability: true`, consider whether `pointInTimeRecovery: true` gives you sufficient protection instead. High availability runs a standby instance that [doubles the instance cost :octicons-link-external-16:](https://cloud.google.com/sql/pricing#instance-pricing).

```yaml title="app.yaml" hl_lines="6"
spec:
  gcp:
    sqlInstances:
      - type: POSTGRES_17
        tier: db-custom-1-3840
        pointInTimeRecovery: true
        databases:
          - name: mydb
```

## Database disk

Cloud SQL [charges for allocated disk space :octicons-link-external-16:](https://cloud.google.com/sql/pricing#storage-networking-prices), not used space.

### Cap automatic disk growth

When `diskAutoresize` is enabled, GCP increases storage automatically when disk usage is high. The disk never shrinks back. Without a limit, this can grow unchecked.

Set `diskAutoresizeLimit` to cap the maximum size in GB:

```yaml title="app.yaml" hl_lines="6-7"
spec:
  gcp:
    sqlInstances:
      - type: POSTGRES_17
        tier: db-custom-1-3840
        diskAutoresize: true
        diskAutoresizeLimit: 50
        databases:
          - name: mydb
```

The default limit is `0` (unlimited). Set it to a value that fits your expected data growth.

See the [diskAutoresize](../application/reference/application-spec.md#gcpsqlinstancesdiskautoresize) and [diskAutoresizeLimit](../application/reference/application-spec.md#gcpsqlinstancesdiskautoresizelimit) reference.

### Use HDD for low-I/O databases

The default disk type is SSD. If your database has low I/O requirements (infrequent reads and writes), HDD is cheaper:

```yaml title="app.yaml" hl_lines="6"
spec:
  gcp:
    sqlInstances:
      - type: POSTGRES_17
        tier: db-custom-1-3840
        diskType: HDD
        databases:
          - name: mydb
```

!!! info
    SSD is the right choice for most production databases. Use HDD only for archival or low-traffic databases.

### Reclaim unused disk space

If your database has far more disk allocated than it actually uses, the only way to reclaim the space is a [database migration](../../persistence/cloudsql/how-to/migrate-to-new-instance.md). Cloud SQL does not support shrinking disk.

## Advanced: database migration

These changes save the most but require a [database migration](../../persistence/cloudsql/how-to/migrate-to-new-instance.md).

### Migrate to the Nais cluster

Databases outside the Nais cluster require a Cloud SQL Proxy sidecar, which adds overhead and cost. Migrating the database into the cluster removes this.

!!! tip
    If you haven't migrated databases before, ask someone with experience first. Instances with non-default settings can be tricky to migrate.

## Monitor your costs

Use the **Cost** and **Utilization** tabs in [Nais Console :octicons-link-external-16:](<<tenant_url("console")>>) to track the effect of your changes over time.
