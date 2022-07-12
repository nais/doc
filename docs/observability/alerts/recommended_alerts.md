# Recommended

## GCP

```yaml
# Dette er en liste over anbefalte Alerts, har du forbedringer, eller forslag
# til Alerts vi bør ha med? Lag en pull request, så merger vi inn!
---
apiVersion: "nais.io/v1"
kind: "Alert"
metadata:
  name: <alert-name>
  namespace: <namespace>
  labels:
    team: <teamname>
spec:
  receivers:
    slack:
      channel: "<appchannel>"
      # <!here> results in a @here message in Slack
      prependText: "<!here> | "
  alerts:
    - alert: applikasjon nede
      # Change <appname> to the name of the app you want to monitor
      expr: kube_deployment_status_replicas_available{deployment="<appname>"} == 0
      for: 2m
      description: "App {{ $labels.app }} er nede i namespace {{ $labels.kubernetes_namespace }}"
      action: "`kubectl describe pod -l app={{ $labels.app }} -n {{ $labels.namespace }}` for events, og `kubectl logs -l app={{ $labels.app }} -n {{ $labels.namespace }}` for logger"
    - alert: høy feilrate i logger
      # Change <appname> to the name of the app you want to monitor
      expr: (100 * sum by (log_app, log_namespace) (rate(logd_messages_total{log_app="<appname>",log_level=~"Warning|Error"}[3m])) / sum by (log_app, log_namespace) (rate(logd_messages_total{log_app="<appname>"}[3m]))) > 10
      for: 3m
      action: "Sjekk loggene til app {{ $labels.log_app }} i namespace {{ $labels.log_namespace }}, for å se hvorfor det er så mye feil"
    - alert: feil i selftest
      # Change <appname> to the name of the app you want to monitor
      expr: selftests_aggregate_result_status{app="<appname>"} > 0
      for: 1m
      action: "Sjekk app {{ $labels.app }} i namespace {{ $labels.kubernetes_namespace }} sine selftest for å se hva som er galt"
    - alert: Høy andel HTTP serverfeil (5xx responser)
      severity: danger
      # Change <appname> to the name of the app you want to monitor and <namespace> to the namespace of the app
      expr: (100 * (sum by (backend) (rate(response_total{status_code=~"^5\\d\\d", namespace="<namespace>", app="<appname>"}[3m])) / sum by (backend) (rate(response_total{namespace="<namespace>", app="<appname>"}[3m])))) > 1
      for: 3m
      action: "Sjekk loggene for å se hvorfor {{ $labels.backend }} returnerer HTTP feilresponser"
    - alert: Høy andel HTTP klientfeil (4xx responser)
      severity: warning
      # Change <appname> to the name of the app you want to monitor and <namespace> to the namespace of the app
      expr: (100 * (sum by (backend) (rate(response_total{status_code=~"^4\\d\\d", namespace="<namespace>", app="<appname>"}[3m])) / sum by (backend) (rate(response_total{namespace="<namespace>", app="<appname>"}[3m])))) > 10
      for: 3m
      action: "Sjekk loggene for å se hvorfor {{ $labels.backend }} returnerer HTTP feilresponser"
```

## On-premises

```yaml
# Dette er en liste over anbefalte Alerts, har du forbedringer, eller forslag
# til Alerts vi bør ha med? Lag en pull request, så merger vi inn!
---
apiVersion: "nais.io/v1"
kind: "Alert"
metadata:
  name: <alert-name>
  namespace: <namespace>
  labels:
    team: <teamname>
spec:
  receivers:
    slack:
      channel: "<appchannel>"
      # <!here> results in a @here message in Slack
      prependText: "<!here> | "
  alerts:
    - alert: applikasjon nede
      # Change <appname> to the name of the app you want to monitor
      expr: kube_deployment_status_replicas_available{deployment="<appname>"} == 0
      for: 2m
      description: "App {{ $labels.app }} er nede i namespace {{ $labels.kubernetes_namespace }}"
      action: "`kubectl describe pod -l app={{ $labels.app }} -n {{ $labels.namespace }}` for events, og `kubectl logs -l app={{ $labels.app }} -n {{ $labels.namespace }}` for logger"
    - alert: høy feilrate i logger
      # Change <appname> to the name of the app you want to monitor
      expr: (100 * sum by (log_app, log_namespace) (rate(logd_messages_total{log_app="<appname>",log_level=~"Warning|Error"}[3m])) / sum by (log_app, log_namespace) (rate(logd_messages_total{log_app="<appname>"}[3m]))) > 10
      for: 3m
      action: "Sjekk loggene til app {{ $labels.log_app }} i namespace {{ $labels.log_namespace }}, for å se hvorfor det er så mye feil"
    - alert: feil i selftest
      # Change <appname> to the name of the app you want to monitor
      expr: selftests_aggregate_result_status{app="<appname>"} > 0
      for: 1m
      action: "Sjekk app {{ $labels.app }} i namespace {{ $labels.kubernetes_namespace }} sine selftest for å se hva som er galt"
    - alert: Høy andel HTTP serverfeil (5xx responser)
      severity: danger
      expr: (100 * (sum by (backend) (rate(traefik_backend_requests_total{code=~"^5\\d\\d", backend=~"mydomain.nais.*/mycontextpath/*"}[3m])) / sum by (backend) (rate(traefik_backend_requests_total{backend=~"mydomain.nais.*/mycontextpath/*"}[3m])))) > 1
      for: 3m
      action: "Sjekk loggene for å se hvorfor {{ $labels.backend }} returnerer HTTP feilresponser"
    - alert: Høy andel HTTP klientfeil (4xx responser)
      severity: warning
      expr: (100 * (sum by (backend) (rate(traefik_backend_requests_total{code=~"^4\\d\\d", backend=~"mydomain.nais.*/mycontextpath/*"}[3m])) / sum by (backend) (rate(traefik_backend_requests_total{backend=~"mydomain.nais.*/mycontextpath/*"}[3m])))) > 10
      for: 3m
      action: "Sjekk loggene for å se hvorfor {{ $labels.backend }} returnerer HTTP feilresponser"
```
