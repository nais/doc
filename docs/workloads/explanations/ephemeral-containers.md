---
tags: [workloads, explanation, ephemeral, container]
---

# Ephemeral containers

Ephemeral container is a temporary container that can be added to an existing pod to perform a specific task, such as debugging, monitoring, or troubleshooting.
Unlike regular containers, ephemeral containers do not persist beyond their immediate use, and they are not part of the pod’s desired state.
Therefore, ephemeral containers can be used for debugging and monitoring when a pod is live in a cluster, without changing the pod spec or restarting its pod.
Ephemeral container is useful when `kubectl exec` is insufficient because a container has crashed or a container image doesn't include debugging utilities.

`kubectl debug` can be used as an additional [debug tool](../how-to/debugging.md#kubectl-debug) for running pods alongside `kubectl describe` and to some extent `kubectl logs` and `kubectl exec`
Unlike `exec` and `logs`, `debug` can also be used when your pod is in crashLoopBackOff or for some other reason dont start.
