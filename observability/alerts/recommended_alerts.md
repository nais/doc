```
# Dette er en liste over anbefalte Alerts, har du forbedringer, eller forslag
# til Alerts vi bør ha med? Lag en pull request, så merger vi inn!
---
apiVersion: "nais.io/v1alpha1"
kind: "Alert"
metadata:
  name: <alert-name>
  labels:
    team: <teamname>
spec:
  receivers:
    slack:
      channel: '<appchannel>'
      prependText: '<!here> | '
  alerts:
    - alert: applikasjon nede
      expr: up{app="<appname>", job="kubernetes-pods"} == 0
      for: 2m
      description: "{{ $labels.app }} er nede i {{ $labels.kubernetes_namespace }}"
      action: "`kubectl describe pod {{ $labels.kubernetes_pod_name }} -n {{ $labels.kubernetes_namespace }}` for events, og `kubectl logs {{ $labels.kubernetes_pod_name }} -n {{ $labels.kubernetes_namespace }}` for logger"
    - alert: høy feilrate i logger
      expr: (100 * sum by (log_app, log_namespace) (rate(logd_messages_total{log_app="<appname>",log_level=~"Warning|Error"}[3m])) / sum by (log_app, log_namespace) (rate(logd_messages_total{log_app="<appname>"}[3m]))) > 90
      for: 3m
      action: "Sjekk loggene til {{ $labels.log_app }} i {{ $labels.log_namespace }}, for å se hvorfor det er så mye feil"
    - alert: feil i selftest
      expr: selftests_aggregate_result_status{app="<appname>"} > 0
      for: 1m
      action: "Sjekk {{ $labels.app }} i {{ $labels.kubernetes_namespace }} sine selftest for å se hva som er galt"
# Java-spesifikk
    - alert: høy feilrate for http-requester
      expr: (100 * sum by (app, kubernetes_namespace) (rate(jetty_responses_total{app="<appname>",code=~"1xx|2xx|3xx"}[3m])) / sum by (app, kubernetes_namespace) (rate(jetty_requests_total{app="<appname>"}[3m]))) < 90
      for: 3m
      action: "Sjekk loggene til {{ $labels.app }} i {{ $labels.kubernetes_namespace }} for å se hvorfor mange http-requests feiler"
```
