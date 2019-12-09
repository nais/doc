# Alerts

We use [Prometheus](https://prometheus.io/) to collect metrics, and can trigger alerts based on these metrics. Alerts are specified in their own Kubernetes resource called `alerts` as we have made our own operator called [Alerterator](https://github.com/nais/alerterator).

This means that you can manage your alerts with `kubectl`, and that alerts are not tied to a specific app or namespace. Giving you more freedom to set up the necessary alerts for one or several apps. You can even make your own personal alert profile.

## Custom alerts

Underneath we have an example for a complete Alert resource, ready to be `kubectl apply -f alerts.yaml`.

```yaml
---
apiVersion: nais.io/v1alpha1
kind: Alert
metadata:
  name: aura-app-alerts
  labels:
    team: aura
spec:
  receivers: # receivers for all alerts below
    slack:
      channel: '#teambeam-alerts-dev'
      prependText: '<!here> | ' # this text will be prepended to the Slack alert title
  alerts:
    - alert: nais-testapp unavailable
      expr: 'kube_deployment_status_replicas_unavailable{deployment="app-name"} > 0'
      for: 2m
      action: Read app logs(kubectl logs appname). Read Application events (kubectl descibe deployment appname)
      description: The app might crash sometimes due to startup errors
      documentation: https://github.com/navikt/aura-doc/naisvakt/alerts.md#app_unavailable
      sla: respond within 1h, during office hours
      severity: danger
```

We also support e-mail as a receiver. See [example alerts](example_alerts.md) and [recommended alerts](recommended_alerts.md).

#### Kubectl

Use `kubectl` to add, update, and remove the alert resource. Adding and updating is done with the `kubectl apply -f alerts.yaml`, while delete is done either with `kubectl delete alert <alert-name>` og `kubectl delete -f alerts.yaml`.

You can list alerts in the cluster with `kubectl get alerts` \(singluar: `alert`, shorten: `al`\), and describe a specific alert resource with `kubectl describe alert <alert-name>`.

#### Writing the `expr`

In order to minimize the feedback loop we suggest experimenting on the Prometheus server to find the right metric for your alert and the notification threshold. The Prometheus server can be found in each [cluster](../../basics/clusters.md), at `https://prometheus.{cluster.ingress}` \(i.e. [https://prometheus.nais.preprod.local](https://prometheus.nais.preprod.local)\).

You can also visit the Alertmanager at `https://alertmanager.{cluster.ingress}` \(i.e. [https://alertmanager.nais.preprod.local](https://alertmanager.nais.preprod.local)\) to see which alerts are triggered now \(you can also silence already triggered alerts\).

#### Expressive descriptions or actions

You can also use `labels` in your Slack/e-mail notification by referencing them with `{{ $labels.<field> }}`. Run your query on the Prometheus server to see which `labels` are available for your alert.

For example:

```text
{{ $labels.node }} is marked as unschedulable
```

turns into the following when posted to Slack/email:

```text
b27apvl00178.preprod.local is marked as unschedulable
```

Another example is how you can avoid specifying all the namespaces your app is running in, by using the `kubernetes_namespace` label in your `action` og `description`. Just add `{{ $labels.kubernetes_namespace }}`, and it will write the namespace for the app that is having problems.

You can read more about this over at the [Prometheus documentation](https://prometheus.io/docs/prometheus/latest/configuration/alerting_rules/#templating).

#### Target several apps or namespaces in a query

Using regular expression, you can target multiple apps or namespaces with one query. This saves on repeating the same alert for each your apps.

```text
absent(up{app=~"myapp|otherapp|thirdapp"})
```

Here we use `=~` to select labels that match the provided string \(or substring\) using a regular expression. Use `!~` to negate the regular expression.

#### Slack @here and @team

Slack has their own syntax for notifying `@channel` or `@here`, respectively `<!channel>` and `<!here>`.

Notifying a user group on the other hand is a bit more complicated. The user group `@nais-vakt` is written `<!subteam^SB8KS4WAV|nais-vakt>` in a Slack alert message, where `SB8KS4WAV` is the id for the specific user group, and `nais-vakt` is the name of the user group.

You can find the id by right clicking on the name in the user group list. Where last part in the URL is the id. The URL will look something like the one below:

```text
https://nav-it.slack.com/usergroups/SB8KS4WAV
```

#### Example of the different Slack/severity colors

Slack alerts supports colors. The severity field defines the color (`good` is results in a green message, `warning` in a yellow and `danger` in a red). If you want to define another color, specify the wanted hex code as severity instead of the pre-defined words.

![Slack colors](../../.gitbook/assets/attachment_color.png)

## Migrating from Naisd

It's pretty straight forward to move alerts from Naisd to Alerterator, as the only difference is that the annotation fields has been move to the top level.

```text
alerts:
- alert: appNotAvailable
  expr: kube_deployment_status_replicas_unavailable{deployment="app-name"} > 0
  for: 5m
  annotations:
    action: Read app logs(kubectl logs appname). Read Application events (kubectl descibe deployment appname)
    severity: Warning
```

should be transformed to

```text
alerts:
- alert: appNotAvailable
  expr: kube_deployment_status_replicas_unavailable{deployment="app-name"} > 0
  for: 5m
  action: Read app logs(kubectl logs appname). Read Application events (kubectl descibe deployment appname)
  severity: Warning
```

Check out the complete [spec](spec.md) for more information about the different keys.

## Flow

![Prometheus Server --> Prometheus Alertmanager](../../.gitbook/assets/prometheus_alertmanager_overview.png)
