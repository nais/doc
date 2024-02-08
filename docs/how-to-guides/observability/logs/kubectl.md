---
description: View logs from the command line using kubectl.
tags: [observability, logs, kubectl]
---
# View logs from the command line

This guide will show you how to view logs from the command line using `kubectl`.

## 0. Prerequisites

- You have installed the [kubectl](../../command-line-access.md) command-line tool.
- You have access to the [team](../../team.md) where the application is running.

## 1. Find the pod name

You can view logs for a specific pod. First, you need to find the name of the pod you want to view logs for.

List all pods in the namespace:

```bash
kubectl get pods -n <namespace>
```

## 2. View logs

View logs for a specific pod:

```bash
kubectl logs <pod-name> -n <namespace>
```
