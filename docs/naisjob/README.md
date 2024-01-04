---
description: This document describes the properties a Naisjob should have.
---

# Naisjob

A Naisjob is very similar to a [NAIS Application](../nais-application/good-practices.md), except that it only runs once by default.
It is built on the Kubernetes [`Job`](https://kubernetes.io/docs/concepts/workloads/controllers/job/) and [`CronJob`](https://kubernetes.io/docs/concepts/workloads/controllers/cron-jobs/) resources.
A `CronJob` runs `Job`s on a time-based schedule, as denoted in `.spec.schedule`.

!!! info "Restart policies"
    Naisjobs have restart policies set to "Never", and it is currently not possible to set the restart policy of a Naisjob directly.
    It is possible to achieve automatic restarts on failure by using [startup probes](reference.md#startup) however, though this requires the Pod to expose an HTTP endpoint to answer the probe.

Below you can find a minimal Naisjob example with a `schedule` for running a `Job` every minute.
If you don't need to have a recurring Naisjob, remove the `schedule` field from the configuration.

```yaml
apiVersion: nais.io/v1
kind: Naisjob
metadata:
  labels:
    team: myteam
  name: myjob
  namespace: myteam
spec:
  image: europe-north1-docker.pkg.dev/[mgmt-id]/[team-name]/[image-name]:tag
  schedule: "*/1 * * * *"
```

Behind the scenes, when you make a `Naisjob`, Kubernetes makes a bunch of different resources for you.
`Naisjob` is one resource that has been defined by the NAIS team.
When you deploy a `Naisjob` with `spec.schedule`, Kubernetes will create a `CronJob` for you.
A `Cronjob` is a Kubernetes native resource.
When the `Cronjob`-`schedule` triggers, Kubernetes will create a `Job`-ressource, which creates a [`Pod`](https://kubernetes.io/docs/concepts/workloads/pods/)-resource.
The `Pod` is what actually runs your code.

If you make a `Naisjob` without `schedule`, Kubernetes will create a `Job`-resource directly, which will create a `Pod`-resource.

Below you can see some of the resources the `Naisjob` `tiltak-okonomi-avstemming` creates.

```bash
$ kubectl tree naisjob tiltak-okonomi-avstemming
NAMESPACE     NAME                                        READY  REASON  AGE
arbeidsgiver  Naisjob/tiltak-okonomi-avstemming           -              109d
arbeidsgiver  ├─Job/tiltak-okonomi-avstemming             -              109d
arbeidsgiver  │ └─Pod/tiltak-okonomi-avstemming-brb7c     True           12d
```

## When will my Naisjob run?

If the `schedule` field is set, the Naisjob will run at the specified schedule.
By default, the timezone used to determine when to run the Naisjob is based on the timezone of the cluster, which is `UTC`.

!!! warning "Daylight saving time"
    If you specify a `timeZone` which observes daylight saving time, your job might run twice or not at all on the day of the daylight saving time change if you schedule it to run at or between the time of the daylight saving time change.

    E.g. if you specify `Europe/Oslo` as your `timeZone`, and schedule your job to run at or between `02:00:00` and `02:59:59`, it will run twice on the day of the daylight saving time change from summer to winter time and not at all on the day of the daylight saving time change from winter to summer time.

If you want to run your Naisjob at a specific time in a specific timezone, you can set the `timeZone` field in the Naisjob spec.

```yaml
# [...]
spec:
  # [...]
  schedule: "0 0 * * *" # Run every day at midnight
  timeZone: "Europe/Oslo"
```

## Re-run Naisjob

If you don't want to run your job at a schedule, but still want to re-run your Naisjob:

```shell
kubectl patch naisjob <name> --type json -p='[{"op": "remove", "path": "/status/synchronizationHash"}]'
```

## Applying your Naisjob to Kubernetes
You can deploy your Naisjob just as you would deploy your Application using [NAIS deploy](../deployment/README.md).

## Shutting down extra containers
Due to the nature of NAIS, your Naisjob might end up having a few sidecars.
Since a sidecar typically has little to no logic to look at sibling containers, these would normally not turn off once your app completes.
As a result, the Naisjob would continue running indefinitely unless some entity from above sorts it out.
To remediate this, an operator named [HAHAHA](https://github.com/nais/hahaha) has been created to run in every cluster and observe every Naisjob.
Once the "main" container in a Naisjob completes, HAHAHA will shut down the surrounding sidecars and thus make the Naisjob run to completion.

You can look at what HAHAHA has done to complete your Naisjob by running `kubectl describe pod my-naisjob-3f91a0` and viewing the Events section.

!!! info "My Naisjob hasn't completed"
    If you see events from HAHAHA but your Naisjob didn't complete, we'd be happy if you could tell us in the #nais channel on Slack.

??? question "I want to manually shut down the sidecars to make the Naisjob complete"

    Here's some legacy documentation on how to shut down most sidecars, in case HAHAHA didn't do its job fully.

    ### Linkerd

    Linkerd exposes an endpoint to shut itself down.

    ```bash
    curl -X POST http://127.0.0.1:4191/shutdown
    ```

    This is done from inside your pod-container.

    ### CloudSQL-proxy sidecar

    CloudSQL-proxy sidecar does not support turning off remotely.

    It can be shut down by running exec into the container.

    ```bash
    kubectl exec yourpod-12345 -c cloudsql-proxy -- kill -s INT 1
    ```

    ### Securelogs

    Securelogs runs on Fluentd, and Fluentd exposes an endpoint to shut itself down.

    ```bash
    curl http://127.0.0.1:24444/api/processes.killWorkers
    ```

    This is done from inside your pod-container.

    Additionally, Securelogs runs a second sidecar called `secure-logs-configmap-reload`.
    This can be shut down by running exec into the container.

    ```basg
    kubectl exec yourpod-12345 -c secure-logs-configmap-reload -- /bin/killall configmap-reload
    ```

    ### Vault sidecar

    Vault sidecar does not support turning off remotely.

    It can be shut down by running exec into the container.

    ```bash
    kubectl exec yourpod-12345 -c vks-sidecar -- /bin/kill -s INT 1
    ```

## Troubleshooting / FAQ


### My NaisJob doesn't want to start any scheduled Jobs

???+ "Answer"

    Sometimes, if the defined schedule attempts to start Jobs frequently without succeeding, Kubernetes will eventually stop
    attempting to start the Job.

    You might see the following event or message for the related CronJob (`kubectl describe cronjob <name>`):

    > Cannot determine if job needs to be started: too many missed start time (> 100). Set or decrease .spec.startingDeadlineSeconds or check clock skew

    Currently, the only way to fix this is to delete the CronJob and NaisJob, and then re-apply or -deploy the NaisJob:

    ```bash
    kubectl delete cronjob <name>
    kubectl delete naisjob <name>
    kubectl apply -f <path-to-naisjob.yaml>
    ```

### How do I force run my scheduled job

???+ "Answer"

    Run the following command to create a ad-hoc job based on your cronjob:

    ```bash
    kubectl create job --namespace=<mynamespace> --from=cronjobs/<naisjobname> <newname>
    ```
