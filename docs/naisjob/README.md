---
description: This document describes the properties a Naisjob should have.
---

# Naisjob
A Naisjob is very similar to a [NAIS Application](../nais-application/README.md), just that it only runs once.
It is built on Kubernetes [Job](https://kubernetes.io/docs/concepts/workloads/controllers/job/) and [CronJob](https://kubernetes.io/docs/concepts/workloads/controllers/cron-jobs/).

!!! warning
    If your Naisjob is running in GCP, or if it is using [Vault sidecar](../naisjob/reference#vaultsidecar) or [Securelogs](../naisjob/reference/#securelogs).
    You need to shut down all containers running in the pod for the job to complete.
    See [Shutting down extra containers](#shutting-down-extra-containers) for more information.

## CronJob
A CronJob runs Jobs on a time-based schedule, as denoted in `.spec.schedule`.

## Applying your Naisjob to Kubernetes
When all the aforementioned steps have been completed, you're finally ready to deploy your `Naisjob` to the cluster.
You can deploy your Naisjob as part of a pipeline with [NAIS deploy](../deployment/README.md).

## Shutting down extra containers
If your Naisjob is running in GCP, or if it is using [Vault sidecar](../naisjob/reference#vaultsidecar) or [Securelogs](../naisjob/reference/#securelogs).
You need to shut down all containers running in the pod for the job to complete.

### Shutting down Linkerd
Linkerd exposes an endpoint to shut itself down.
```
curl -X POST http://127.0.0.1:4191/shutdown
```
This is done from inside your pod-container.

### Securelogs
TBA

### Vault sidecar
TBA
