# Troubleshooting

## Don't panic!

| Deployment status | Description |
| :--- | :--- |
| success | Everything is fine, your application has been deployed, and is up and running. |
| queued | Deployment request accepted, waiting to be deployed. |
| in\_progress | Application deployed to Kubernetes, waiting for new version to start. |
| failure | Your application failed to start. Check state with `kubectl describe app <APP>`. |
| error | Either an error in your request, or the deployment system has issues. Check the logs. |

## First debugging steps

When something is wrong with your application, these kubectl tools should be the first things you check out:

Describe the pod to find statuses and messages:

```text
kubectl describe pod <podname>
```

And view the logs for your pods with this command:

```text
kubectl logs <podname>
```

## Logs

All deployments are logged to Kibana. You can get a direct link to your deployment logs from the `https://github.com/navikt/<YOUR_REPOSITORY>/deployments` page. Click on the link that says _deployed_.

This link is also printed in the console output. It looks like `https://deployment.prod-sbs.nais.io/logs?delivery_id=<UUID>&ts=<TIMESTAMP>`.

## FAQ

| Message | Action |
| :--- | :--- |
| You don't have access to apikey/. | See _Access to Vault_ in the [Teams documentation](../basics/teams.md) |
| 403 authentication failed | Either you're using the wrong _team API key_, or if using the old version of NAIS deploy, your team is not [registered in the team portal](../basics/teams.md). |
| 502 bad gateway | There is some transient error with GitHub or Vault. Please try again later. If the problem persists, ask _@nais-team_ for help. |
| deployment failed: failed authentication | Wrong _team API key_, please check [https://deploy.nais.io/](https://deploy.nais.io/) for the correct key. |
| failed authentication: HMAC signature error | See above. |
| "tobac.nais.io" denied the request: user 'system:serviceaccount:default:serviceuser-FOO' has no access to team 'BAR' | The application is already deployed, and team names differ. See [changing teams](change-team.md). |
| “tobac.nais.io” denied the request: team 'FOO' on existing resource does not exist | The team owning the resource may have been deleted or renamed. Ask _@nais-team_ for help. |
| the server could not find the requested resource \(total of 1 errors\) | The resource is not specifying its namespace. |

## Asking on Slack

If you read this entire page, and checked your logs, and checked application status with `kubectl`, you can ask Slack for help. Use the [\#nais](https://nav-it.slack.com/archives/C5KUST8N6) channel and include the following information:

* Application
* Team tag
* Namespace
* Cluster name
* Link to logs
* What steps you already took to debug the error

