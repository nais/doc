---
tags: [application, naisjob, workloads, troubleshooting, debugging, how-to]
---

# Troubleshooting

## Don't panic

| Deployment status | Description                                                                           |
|:------------------|:--------------------------------------------------------------------------------------|
| success           | Everything is fine, your application has been deployed, and is up and running.        |
| queued            | Deployment request accepted, waiting to be deployed.                                  |
| in\_progress      | Application deployed to Kubernetes, waiting for new version to start.                 |
| failure           | Your application failed to start. Check state with `kubectl describe app <APP>`.      |
| error             | Either an error in your request, or the deployment system has issues. Check the logs. |

## First debugging steps

When something is wrong with your application, these [kubectl](../../operate/how-to/command-line-access.md#install-kubectl) commands should be the first things
you check out:

### List the pods for your application for a quick overview of their status

```text
kubectl get po -l app=<appname>
```

### Describe a given pod to get more detailed statuses and messages

```text
kubectl describe pod <podname>
```

This may reveal which container is failing and any exit codes that are emitted.

### View the logs for your pods

```text
kubectl logs <podname>
```

This will output the logs from your application container.

If there are other containers in your pod (which you can see from the `describe` command above), you may view the
logs by specifying the exact container:

```text
kubectl logs <podname> -c <container>
```

## Logs and traces

All deployments have logs collected from all parts of the deployment process.
These logs can be found by following the link from the deploy-action logs in Github.
This link looks like `<<tenant_url('deploy', 'logs?delivery_id=<UUID>&ts=<TIMESTAMP>...')>>`.

Additionally, there is a link to grafana to show the trace for the deployment.
This link looks like `<<tenant_url('grafana', 'd/<dashboard_id>/deploy-tracing-drilldown?var-trace_id=<trace id>')>>`.


## Error messages

| Message                                                                                                                         | Action                                                                                                                        |
|:--------------------------------------------------------------------------------------------------------------------------------|:------------------------------------------------------------------------------------------------------------------------------|
| 502 bad gateway                                                                                                                 | There is some transient error with GitHub. Please try again later. If the problem persists, [ask for help](#asking-on-slack). |
| applications.nais.io is forbidden: User "..." cannot create resource "applications" in API group "nais.io" at the cluster scope | You forgot to specify the `.namespace` attribute in `nais.yaml`.                                                              |
| the server could not find the requested resource \(total of 1 errors\)                                                          | The resource is not specifying its namespace.                                                                                 |
| MountVolume.SetUp failed for volume "<some-secret>" : secret "<some-secret>" not found                                          | See [secret not found](#secret-not-found).                                                                                    |
| no team specified, and unable to auto-detect from nais.yaml                                                                     | The resource is missing the "team" label.                                                                                     |
| Error: fatal: Unauthenticated: authentication token has expired                                                                 | The token issued at the start of the github workflow has a lifetime of 10 minutes. Is your workflow taking too long?          |

## Secret not found

When describing a pod or inspecting the deployment logs, you might find the following message:

```shell
Events:
  Type     Reason       Age                From               Message
  ----     ------       ----               ----               -------
  ...
  Warning  FailedMount  22m (x5 over 22m)  kubelet            MountVolume.SetUp failed for volume "<secret-name>" : secret "<secret-name>" not found
```

Some secrets needed to interact with external systems are _eventually consistent_.

Typically, the message appears on either:

1. First-time deployments where the secret has to be provisioned, or
2. As part of a _secret rotation_ process

Generally, the warning message should not persist or be stuck for more than a minute.

One exception to this rule is the secrets to connect to [Postgres](../../persistence/postgres/README.md) when the application is first deployed.
Creating [SQLInstances](../../persistence/postgres/explanations/cloud-sql-instance.md) takes time, usually as much as 8-10 minutes, and the first deploy will usually time out and be marked as failed while waiting for the SQLInstance to be created.
It will eventually resolve itself, and the next deploy will succeed.

Follow the steps below to verify that the secret exists:

### Step 1. Verify Pod events

???+ success

    If the event log looks like this:

    ```shell hl_lines="5 8-9"
    Events:
    Type     Reason       Age                    From               Message
    ----     ------       ----                   ----               -------
    Normal   Scheduled    2m22s                  default-scheduler  Successfully assigned <namespace>/<pod> to <node>
    Warning  FailedMount  2m20s (x3 over 2m22s)  kubelet            MountVolume.SetUp failed for volume "<secret-name>" : secret "<secret-name>" not found
    Normal   Pulling      2m18s                  kubelet            Pulling image "<docker-image>"
    Normal   Pulled       117s                   kubelet            Successfully pulled image "<docker-image>"
    Normal   Created      61s (x4 over 115s)     kubelet            Created container <app>
    Normal   Started      61s (x4 over 115s)     kubelet            Started container <app>
    ```

Then the secret was successfully found and your application's container has been started.

???+ failure

    If the event log looks like this:

    ```shell hl_lines="5-7"
    Events:
    Type     Reason       Age                   From               Message
    ----     ------       ----                  ----               -------
    Normal   Scheduled    4m53s                 default-scheduler  Successfully assigned <namespace>/<pod> to <node>
    Warning  FailedMount  2m50s                 kubelet            Unable to attach or mount volumes: unmounted volumes=[<secret-name>], unattached volumes=[<secret-name>]: timed out waiting for the condition
    Warning  FailedMount  43s (x10 over 4m53s)  kubelet            MountVolume.SetUp failed for volume "<secret-name>" : secret "<secret-name>" not found
    Warning  FailedMount  35s                   kubelet            Unable to attach or mount volumes: unmounted volumes=[<secret-name>], unattached volumes=[<secret-name>]: timed out waiting for the condition
    ```

Then you should [ask for help](#asking-on-slack) on Slack.

### Step 2. Verify that the Secret exists

With [kubectl](../../operate/how-to/command-line-access.md#install-kubectl),
run the following command to verify that the secret exists:

```shell
kubectl get secret <secret-name>
```

???+ success

    ```shell
    ➜ kubectl get secret my-secret

    NAME        TYPE     DATA  AGE
    my-secret   Opaque   3     15h
    ```

???+ failure

    ```shell
    ➜ kubectl get secret my-secret

    Error from server (NotFound): secrets "my-secret" not found
    ```

### Step 3. Check related resources

Depending on which system provides the secret, there are other resources that could contain information about your problem.
By looking at these resources, you can often find the direct cause of the problem.
See the following table for information about which resources you can look at for various kinds of secrets.
Once you know the type of resource, use `kubectl describe <resource> <app name>` to look at it.
Typically, you should inspect the `Status` parts of the output.

| Type of secret                               | Resource to check  |
|----------------------------------------------|--------------------|
| Postgres user credentials (`google-sql-...`) | sqluser            |
| Postgres certificates (`sqeletor-...`)       | sqlsslcert         |
| Kafka (`aiven-...`)                          | aivenapp           |
| OpenSearch (`aiven-...`)                     | aivenapp           |
| Influx (`aiven-...`)                         | aivenapp           |
| Valkey (`aiven-...`)                         | aivenapp           |
| Entra-ID (`azure-...`)                       | azureapp           |
| TokenX (`tokenx-...`)                        | jwker              |
| ID porten (`idporten-...`)                   | idportenclient     |
| Maskinporten (`maskinporten-...`)            | maskinportenclient |

#### `sqluser` and `sqlsslcert` 

When the SQLInstance is not ready, either because it is still being created, or some modification is being made to it, the `sqluser` and `sqlsslcert` resources will not be updated, which again blocks creation of secrets.

Possible causes and how to resolve them:

 - An existing certificate blocks creation of a new one.  
   See [Certification sync issues](../../persistence/postgres/how-to/certification-sync-issues.md) for more information.
 - Attempting to assign a private IP to an existing Cloud SQL instance. 
   See [Failing to assign private IP to an existing Cloud SQL instance](../../persistence/postgres/how-to/existing-instance-private-ip.md) for more information.

### Step 4. Ask for help

If you have followed the above checklist, verified that the secret does not exist, and can't see a reason for that, please contact [#nais](#asking-on-slack) for further assistance.

## Asking on Slack

If you read this entire page, and checked your logs, and checked application status with `kubectl`, you can ask Slack for help.
Make sure to include the following information:

* Application
* Team tag
* Namespace
* Cluster name
* Link to logs
* What steps you already took to debug the error
