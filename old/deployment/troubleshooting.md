# Troubleshooting

## Don't panic!

| Deployment status | Description                                                                           |
|:------------------|:--------------------------------------------------------------------------------------|
| success           | Everything is fine, your application has been deployed, and is up and running.        |
| queued            | Deployment request accepted, waiting to be deployed.                                  |
| in\_progress      | Application deployed to Kubernetes, waiting for new version to start.                 |
| failure           | Your application failed to start. Check state with `kubectl describe app <APP>`.      |
| error             | Either an error in your request, or the deployment system has issues. Check the logs. |

## First debugging steps

When something is wrong with your application, these [kubectl](../basics/access.md) commands should be the first things
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

## Logs

All deployments are logged to Kibana. You can get a direct link to your deployment logs from the `https://github.com/navikt/<YOUR_REPOSITORY>/deployments` page. Click on the link that says _deployed_.

This link is also printed in the console output. It looks like `https://deployment.prod-gcp.nais.io/logs?delivery_id=<UUID>&ts=<TIMESTAMP>`.

## Error messages

| Message                                                                                                                         | Action                                                                                                                                                          |
|:--------------------------------------------------------------------------------------------------------------------------------|:----------------------------------------------------------------------------------------------------------------------------------------------------------------|
| 403 authentication failed                                                                                                       | Either you're using the wrong _team API key_, or if using the old version of NAIS deploy, your team is not [registered in the team portal](../basics/teams.md). |
| 502 bad gateway                                                                                                                 | There is some transient error with GitHub. Please try again later. If the problem persists, ask _@nais-team_ for help.                                          |
| deployment failed: failed authentication                                                                                        | Wrong _team API key_, please check [console](https://console.nav.cloud.nais.io) for the correct key.                                                            |
| failed authentication: HMAC signature error                                                                                     | See above.                                                                                                                                                      |
| applications.nais.io is forbidden: User "..." cannot create resource "applications" in API group "nais.io" at the cluster scope | You forgot to specify the `.namespace` attribute in `nais.yaml`.                                                                                                |
| the server could not find the requested resource \(total of 1 errors\)                                                          | The resource is not specifying its namespace.                                                                                                                   |
| MountVolume.SetUp failed for volume "<some-secret>" : secret "<some-secret>" not found                                          | See [secret not found](#secret-not-found).                                                                                                                      |
| no team specified, and unable to auto-detect from nais.yaml                                                                     | The resource is missing the "team" label.                                                                                                                       |

## Secret not found

When describing a pod or inspecting the deployment logs, you might find the following message:

```shell
Events:
  Type     Reason       Age                From               Message
  ----     ------       ----               ----               -------
  ...
  Warning  FailedMount  22m (x5 over 22m)  kubelet            MountVolume.SetUp failed for volume "<secret-name>" : secret "<secret-name>" not found
```

Some secrets (such as those from [Azure AD](../security/auth/azure-ad/README.md) or [Kafka](../persistence/kafka/README.md)) are _eventually consistent_.

Typically, the message appears on either:

1. First-time deployments where the secret has to be provisioned, or
2. As part of a _secret rotation_ process

Generally, the warning message should not persist or be stuck for more than a minute.

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

    Then you should report this to the [#nais](#asking-on-slack) channel on Slack.

### Step 2. Verify that the Secret exists

With [kubectl](../basics/access.md#install-kubectlhttpskubernetesiodocstaskstoolsinstall-kubectl),
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

| Type of secret | Resource to check  |
|----------------|--------------------|
| Kafka          | aivenapp           |
| OpenSearch     | aivenapp           |
| Influx         | aivenapp           |
| Azure AD       | azureapp           |
| TokenX         | jwker              | 
| ID porten      | idportenclient     |
| Maskinporten   | maskinportenclient |


If you have followed the above checklist, verified that the secret does not exist, and can't see a reason for that, please contact [#nais](#asking-on-slack) for further assistance.

## Asking on Slack

If you read this entire page, and checked your logs, and checked application status with `kubectl`, you can ask Slack for help. Use the [\#nais](https://nav-it.slack.com/archives/C5KUST8N6) channel and include the following information:

* Application
* Team tag
* Namespace
* Cluster name
* Link to logs
* What steps you already took to debug the error
