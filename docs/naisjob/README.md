---
description: This document describes the properties a Naisjob should have.
---

# Naisjob
A Naisjob is very similar to a [NAIS Application](../nais-application/README.md), just that it only runs once.
It is built on Kubernetes [Job](https://kubernetes.io/docs/concepts/workloads/controllers/job/) and [CronJob](https://kubernetes.io/docs/concepts/workloads/controllers/cron-jobs/).
Compared to an Application, a Job will only start a pod once. 
A CronJob runs Jobs on a time-based schedule, as denoted in `.spec.schedule`.

Below you can find a minimal Naisjob example with a `schedule` for running a Job every minute.
If you don't need to have a recurring Naisjob you can just remove `schedule`.
```
apiVersion: nais.io/v1
kind: Naisjob
metadata:
  labels:
    team: myteam
  name: myjob
  namespace: myteam
spec:
  image: ghcr.io/navikt/myapp:mytag
  schedule: "1/* * * * *"
```

!!! warning
    If your Naisjob is running in GCP, or if it is using [Vault sidecar](../naisjob/reference#vaultsidecar) or [Securelogs](../naisjob/reference/#securelogs).
    You need to shut down all containers running in the pod for the job to complete.
    See [Shutting down extra containers](#shutting-down-extra-containers) for more information.

## Applying your Naisjob to Kubernetes
You can deploy your Naisjob just as you would deploy your Application using [NAIS deploy](../deployment/README.md).

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
Securelogs runs on Fluentd, and Fluentd exposes an endpoint to shut itself down.
```
curl /api/processes.killWorkers
```
This is done from inside your pod-container.

### Vault sidecar
Vault sidecar does not support turning off remotely.
