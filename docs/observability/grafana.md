# Grafana

Grafana is an open source analytics and monitoring solution most known for its flexibility in visualizing metrics. It is commonly used together with Prometheus, but also supports other data sources such as InfluxDB, and Google Cloud Monitoring.

## Accessing Grafana

Grafana is available at `https://grafana.<tenant>.cloud.nais.io`. You can log in with your personal user account as long as you have a

### Running Grafana from a big screen

In order to run Grafana from a big screen, you will need a Grafana service account. You get this by contacting us in the [#nais](https://nav-it.slack.com/archives/C5KUST8N6) channel on Slack.

Once you have a Grafana service account, you can use the following URL to access Grafana: `https://grafana-infoskjerm.<tenant>.cloud.nais.io`. You will need to add your service account credentials to the `Authorization` header of your requests like so `Authorization: Bearer <service-account-token>`.

To add the service account credentials to the header of your requests, you can use the [Modify Header Value](https://mybrowseraddon.com/modify-header-value.html) browser extension available for Chrome and Firefox.

Set the following configuration in the extension:

| Field        | Value                                                 |
| ------------ | ----------------------------------------------------- |
| URL          | `https://grafana-infoskjerm.<tenant>.cloud.nais.io/*` |
| Domain       | ✅                                                     |
| Header name  | `Authorization`                                       |
| Add          | ✅                                                     |
| Header value | `Bearer <service-account-token>`                      |
| State        | Active                                                |

## Dictionary

### Dashboard

A dashboard is a collection of visualizations, which can be arranged in a grid layout. Dashboards are usually created to monitor a specific system or process. For example, a dashboard can be created to monitor the health of a Kubernetes cluster, or to monitor the performance of a specific application.

### Panel

A panel is a single visualization. A dashboard can contain multiple panels, each of which can be configured to display different metrics.

### Query

A query is a request for data from a data source. For example, a query can be used to request the average CPU usage of a Kubernetes cluster over the last 24 hours.

### Data source

A data source is a source of data for Grafana. For example, a data source can be a Prometheus server, which can be queried for metrics.
