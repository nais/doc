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
  schedule: "*/1 * * * *"
```

## Re-run Naisjob
If you don't want to run your job at a schedule, but still want to re-run your Naisjob, you either have to delete the old Naisjob first, og run under a different name.

## Applying your Naisjob to Kubernetes
You can deploy your Naisjob just as you would deploy your Application using [NAIS deploy](../deployment/README.md).

## Shutting down extra containers
Due to the nature of NAIS, your Naisjob might end up having a few sidecars.
Since a sidecar typically has little to no logic to look at sibling containers, these would normally not turn off once your app completes. 
As a result, the Naisjob would continue running indefinitely unless some entity from above sorts it out.
To remediate this, an operator named [Ginuudan](https://github.com/nais/ginuudan) has been created to run in every cluster and observe every Naisjob.
Once the "main" container in a Naisjob completes, Ginuudan will shut down the surrounding sidecars and thus make the Naisjob run to completion.

You can look at what Ginuudan has done to complete your Naisjob by running `kubectl describe pod my-naisjob-3f91a0` and viewing the Events section.

!!! info "My Naisjob hasn't completed"
    If you see no events from Ginuudan in your Naisjob, you might want to redeploy it.
    Naisjobs deployed before Ginuudan was published will not be observed by Ginuudan.

    If you do see events from Ginuudan but your Naisjob didn't complete, we'd be happy if you could tell us in the #nais channel on Slack.

??? question "My Naisjob deployment is old, and I want to manually shut down the sidecars to make the Naisjob complete"

    Here's some legacy documentation on how to shut down most sidecars.

    ### Linkerd
    Linkerd exposes an endpoint to shut itself down.
    ```
    curl -X POST http://127.0.0.1:4191/shutdown
    ```
    This is done from inside your pod-container.

    ### CloudSQL-proxy sidecar
    CloudSQL-proxy sidecar does not support turning off remotely.

    It can be shut down by running exec into the container.
    ```
    kubectl exec yourpod-12345 -c cloudsql-proxy -- kill -s INT 1
    ```

    ### Securelogs
    Securelogs runs on Fluentd, and Fluentd exposes an endpoint to shut itself down.
    ```
    curl http://127.0.0.1:24444/api/processes.killWorkers
    ```
    This is done from inside your pod-container.

    Additionally, Securelogs runs a second sidecar called `secure-logs-configmap-reload`.
    This can be shut down by running exec into the container.

    ```
    kubectl exec yourpod-12345 -c secure-logs-configmap-reload -- /bin/killall configmap-reload
    ```

    ### Vault sidecar
    Vault sidecar does not support turning off remotely.

    It can be shut down by running exec into the container.
    ```
    kubectl exec yourpod-12345 -c vks-sidecar -- /bin/kill -s INT 1
    ```