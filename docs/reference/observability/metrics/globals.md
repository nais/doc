---
tags: [reference, metrics]
---

# Global Metrics

This is a list of metrics exposed by nais for all applications.

## Common Labels

The following labels are common to most metrics:

| Label       | Description                                                                                                         |
| ----------- | ------------------------------------------------------------------------------------------------------------------- |
| `namespace` | The Kubernetes namespace in which the application is running.                                                       |
| `pod`       | The name of the pod in which the application is running. This will be unique for each instance of your application. |
| `container` | The name of the container in which the application is running. This will be the same as your application name.      |
| `service`   | The name of the service in which the application is running.                                                        |
| `node`      | The name of the node on which the application is running.                                                           |
| `image`     | The name of the container image in which the application is running.                                                |

## Memory and CPU Usage

### Memory Usage

The `container_memory_usage_bytes` metric tracks the amount of memory used by a container.

```promql
container_memory_usage_bytes{container="my-application", ...}
```

### CPU Usage

The `container_cpu_usage_seconds_total` metric tracks the amount of CPU time used by a container.

```promql
container_cpu_usage_seconds_total{container="my-application", ...}
```

Since this metric is cumulative, you can calculate the rate of CPU usage by using the `rate` function.

```promql
rate(container_cpu_usage_seconds_total{container="my-application", ...}[5m])
```

### Limits and Requests

The `kube_pod_container_resource_limits` and `kube_pod_container_resource_requests` metrics track the resource limits and requests for a container.

```promql
kube_pod_container_resource_limits{resource="memory", container="my-application", ...}
kube_pod_container_resource_requests{resource="memory", container="my-application", ...}
kube_pod_container_resource_limits{resource="cpu", container="my-application", ...}
kube_pod_container_resource_requests{resource="cpu", container="my-application", ...}
```

### Out of Memory (OOMKilled)

Out of memory restarts occur when a container exceeds its memory limit and the kernel kills the process to free up memory. OOM kills can be caused by a variety of factors, including memory leaks, excessive memory usage, and insufficient memory limits.

The `kube_pod_container_status_terminated_reason` metric tracks the number of times a container has been terminated for various reasons, including OOM kills.

```promql
kube_pod_container_status_terminated_reason{reason="OOMKilled", ...}
```

Other reasons for container termination include `Error`, `Completed`, and `ContainerCannotRun`.
