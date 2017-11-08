# Metrics

Metrics must be published according to the https://prometheus.io standards. Metrics will be collected if the nais.yml file permits it.

Apps will get a dashboard on https://grafana.adeo.no/dashboard/db/nais-app-dashboard

```
prometheus: #Optional
  enabled: false # if true the pod will be scraped for metrics by prometheus
  path: /metrics # Path to prometheus-metrics
```



JVM Applications should use https://github.com/prometheus/client_java. And make sure do export defaultmetrics.
```
DefaultExports.initialize();
```
Push metrics can be sent to sensu on 

```
sensu.nais:3030
```
