---
description: This document describes the properties a Naisjob should have.
---

# Naisjob
A Naisjob is very similar to a [NAIS Application](../nais-application/README.md), except that it only runs once by default.
It is built on the Kubernetes [`Job`](https://kubernetes.io/docs/concepts/workloads/controllers/job/) and [`CronJob`](https://kubernetes.io/docs/concepts/workloads/controllers/cron-jobs/) resources.
A `CronJob` runs `Job`s on a time-based schedule, as denoted in `.spec.schedule`.

!!! info "Restart policies"
    Naisjobs have restart policies set to "Never", and it is currently not possible to set the restart policy of a Naisjob directly.
    It is possible to achieve automatic restarts on failure by using [startup probes](reference/#startup) however, though this requires the Pod to expose an HTTP endpoint to answer the probe.

Below you can find a minimal Naisjob example with a `schedule` for running a `Job` every minute.
If you don't need to have a recurring Naisjob, remove the `schedule` field from the configuration.
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
    If your Naisjob is [running in GCP](../clusters/gcp/), or if it is using [Vault sidecar](reference/#vaultsidecar) or [Securelogs](reference/#securelogs).
    You need to shut down all containers running in the pod for the `Job` to complete.
    See [Shutting down extra containers](#shutting-down-extra-containers) for more information.

## Applying your Naisjob to Kubernetes
You can deploy your Naisjob just as you would deploy your Application using [NAIS deploy](../deployment/README.md).

## Shutting down extra containers
If your Naisjob has any of these traits:

 * [runs in GCP](../clusters/gcp/)
 * [uses Vault sidecar](reference/#vaultsidecar)
 * [uses Securelogs](reference/#securelogs)

You will need to shut down all containers running in the pod for the `Job` to complete.

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
