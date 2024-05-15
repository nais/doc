---
description: View logs from the command line using kubectl.
tags: [how-to, logging, observability, command-line]
---

# View logs from the command line

This guide will show you how to view logs from the command line using `kubectl`.

## Prerequisites

- You have installed the [kubectl](../../../operate/how-to/command-line-access.md) command-line tool.
- You have access to the [team](../../../explanations/team.md) where the application is running.

## Find the pod name

You can view logs for a specific pod. First, you need to find the name of the pod you want to view logs for.

List all pods in the namespace:

```bash
kubectl get pods -n <namespace>
```

## View logs

View logs for a specific pod:

```bash
kubectl logs <pod-name> -n <namespace>
```
