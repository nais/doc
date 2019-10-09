# Example

```text
apiVersion: "nais.io/v1alpha1"
kind: "Alert"
metadata:
  name: nais-testapp
  namespace: default
  labels:
    team: aura
spec:
  receivers: # receivers for all alerts below
    slack:
      channel: '#nais-alerts-dev'
      prependText: '<!here> | ' # this text will be prepended to the Slack alert title
    email:
      to: 'auravakt@nav.no' # sends email as well
      send_resolved: false # notify about resolved alerts
  alerts:
    - alert: Nais-testapp unavailable
      description: Oh noes, it looks like Nais-testapp is down
      expr: 'kube_deployment_status_replicas_unavailable{deployment="nais-testapp"} > 0'
      for: 2m
      action: kubectl describe pod -l app=nais-testapp
      documentation: https://github.com/navikt/aura-doc/naisvakt/alerts.md#app_unavailable
      sla: respond within 1h, during office hours
      severity: critical
    - alert: CoreDNS unavailable
      description: CoreDNS unavailable, there are zero replicas
      expr: 'kube_deployment_status_replicas_available{namespace="kube-system", deployment="coredns"} == 0'
      for: 1m
      action: kubectl describe pod -l app=nais-testapp
      documentation: https://github.com/navikt/aura-doc/naisvakt/alerts.md#coredns
      sla: respond within 1h, solve within 4h, around the clock
      severity: critical
```

