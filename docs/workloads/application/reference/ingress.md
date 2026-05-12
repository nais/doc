---
tags: [workloads, reference, ingress]
---

# Ingress reference

This is the reference documentation for [ingresses](../explanations/expose.md#ingress) in Nais.

Ingress is the only way to expose your application to the outside world, this is not the recommended way to communicate between applications running in the same environment. For that, you should use [service discovery](../explanations/expose.md#service-discovery).

## Domains

See the [environments reference](../../reference/environments.md) for a list of available domains and their intended use.

## Path-based routing

Ingresses may include paths. This allows for routing traffic to only specific parts of your application, or as part of a shared domain between multiple applications like this:

```yaml
spec:
  ingresses:
    - https://myapplication.example.com/path1
    - https://myapplication.example.com/path2
```

In the example above, only `path1` and `path2` are routed to the application including any sub-paths. All other paths may return a `404` error. Please keep in mind that no path stripping is done as part of the routing and the full path is passed to the application.

## Ingress redirects

[ingress redirects](../explanations/expose.md#ingress-redirects) is a way to perform redirects in Nais.

Ingress redirects are used to redirect traffic from one domain to another. This can be useful when you want to change the domain of an application or when you want to redirect traffic from an old domain to a new one.

## Ingress customization

Ingresses are automatically created for your application when you specify them in your [application manifest](application-spec.md).
The ingress is created with a set of default values that should work for most applications.

You can tweak the ingress configuration by specifying certain [Kubernetes annotations][kubernetes-annotations] in your application manifest.
Any annotation from [the HAProxy ingress annotation reference][haproxy-ingress-annotations] which starts with `haproxy.org/` is supported.

[kubernetes-annotations]: https://kubernetes.io/docs/concepts/overview/working-with-objects/annotations/
[haproxy-ingress-annotations]: https://www.haproxy.com/documentation/kubernetes-ingress/community/configuration-reference/ingress
[haproxy-set-log-level]: https://docs.haproxy.org/3.0/configuration.html#4.2-http-request
[haproxy-timeout-http-request]: https://docs.haproxy.org/3.0/configuration.html#4.2-timeout%20http-request
[service-discovery]: ../../how-to/communication.md

### Custom timeouts

In some scenarios it is required to have different values for various timeouts.
HAProxy provides several `timeout-*` annotations that can be set per-ingress, for example:

* `haproxy.org/timeout-server` - backend response timeout
* `haproxy.org/timeout-client` - client send timeout
* `haproxy.org/timeout-connect` - backend connection timeout

All timeout values require a time unit suffix (e.g. `60s`, `5m`, `1h`).

See the [HAProxy ingress annotation reference][haproxy-ingress-annotations] for the full list of available timeout annotations and their default values.

## WebSockets Support

Support for websockets is provided by the HAProxy ingress controller out of the box.
No special configuration required.
The only requirement to avoid the close of connections is the increase of the values of `timeout-server` and `timeout-client`.
The default value of these settings is `50s`.

A more adequate value to support websockets is a value higher than one hour (`1h`).

```yaml
apiVersion: nais.io/v1alpha1
kind: Application
metadata:
  name: myapplication
  namespace: myteam
  annotations:
    haproxy.org/timeout-server: "2h"
    haproxy.org/timeout-client: "2h"
spec:
  ...
```

## Metrics

All requests to your application via ingress will result in metrics being emitted to Prometheus.
The metrics are prefixed with `haproxy_` and are available per-backend and per-frontend.

Relevant backend metrics include:

??? info "Ingress metrics descriptions"

    | Metric                                          | Description                                                      | Type    |
    | ----------------------------------------------- | ---------------------------------------------------------------- | ------- |
    | `haproxy_backend_http_requests_total`           | Total number of HTTP requests processed by this backend          | counter |
    | `haproxy_backend_http_responses_total`          | Total number of HTTP responses returned, labeled by status class | counter |
    | `haproxy_backend_response_time_average_seconds` | Average response time for last 1024 successful connections       | gauge   |
    | `haproxy_backend_current_sessions`              | Number of current sessions on the backend                        | gauge   |
    | `haproxy_backend_connection_errors_total`       | Total number of failed connections to server                     | counter |

??? info "Useful labels for filtering"

    | Label   | Description                                                                                                          |
    | ------- | -------------------------------------------------------------------------------------------------------------------- |
    | `proxy` | Backend identifier in the format `{namespace}_svc_{service-name}_{protocol}` (e.g. `myteam_svc_myapp_http`) |
    | `code`  | HTTP response status class (`1xx`, `2xx`, `3xx`, `4xx`, `5xx`, `other`)                                              |

See the [HAProxy metrics reference][haproxy-metrics] for the full list of available metrics.

[haproxy-metrics]: https://www.haproxy.com/documentation/kubernetes-ingress/administration/metrics/

### Uptime probes

All ingresses will automatically have uptime probes enabled on them.
This probe will be directed at the [application's readiness endpoint](application-spec.md#readiness) using an HTTP GET request.
A probe is considered successful if the HTTP status code is `2xx` or `3xx`.
The probe is considered failed if the HTTP status code is `4xx` or `5xx`.

You can query the uptime probe status using the following PromQL query:

```promql
probe_success{app="my-app"} == 1
```

### Example PromQL Queries

Number of HTTP responses from the `myapp` backend, grouped by status code class:

```promql
sum by (code) (haproxy_backend_http_responses_total{proxy=~"myteam_svc_myapp.*"})
```

Rate of `5xx` errors from the `myapp` backend:

```promql
sum(rate(haproxy_backend_http_responses_total{proxy=~"myteam_svc_myapp.*", code="5xx"}[3m]))
```

Percentage of `5xx` errors to the `myapp` application as a ratio of total requests:

```promql
100 * (
  sum(rate(haproxy_backend_http_responses_total{proxy=~"myteam_svc_myapp.*", code="5xx"}[3m]))
  /
  sum(rate(haproxy_backend_http_requests_total{proxy=~"myteam_svc_myapp.*"}[3m]))
)
```

## Ingress access logs

Ingress access logs are enabled by default for all applications and accessible from [Grafana Log Explorer](https://grafana.<<tenant()>>.cloud.nais.io/a/grafana-lokiexplore-app/explore) by selecting the `nais-ingress` service.

From there you can use the Filter tab to search for logs from your application by using the `ingress_namespace`, `ingress_name` and `url_domain` labels.

{% if tenant() == "nav" %}

Ingress logs for on-premise applications are available in nav-logs (OpenSearch Dashboards).
Here are pre-configured queries for ingress logs in the different environments:

| nav-logs (OpenSearch Dashboards) | Grafana Loki              |
| -------------------------------- | ------------------------- |
| [dev-gcp][dev-gcp-opensearch]    | [dev-gcp][dev-gcp-loki]   |
| [prod-gcp][prod-gcp-opensearch]  | [prod-gcp][prod-gcp-loki] |
| [dev-fss]                        | -                         |
| [prod-fss]                       | -                         |

[dev-gcp-opensearch]: https://logs.az.nav.no/app/discover#/view/1638d780-3369-11ed-b3e8-d969437dd878?_g=()
[prod-gcp-opensearch]: https://logs.az.nav.no/app/discover#/view/1d10b410-3369-11ed-b3e8-d969437dd878?_g=()
[dev-fss]: https://logs.az.nav.no/app/discover#/view/e7562030-3368-11ed-b3e8-d969437dd878?_g=()
[prod-fss]: https://logs.az.nav.no/app/discover#/view/00c05220-3369-11ed-b3e8-d969437dd878?_g=()
[dev-gcp-loki]: https://grafana.nav.cloud.nais.io/d/ingress-logs/ingress-logs?var-env=dev
[prod-gcp-loki]: https://grafana.nav.cloud.nais.io/d/ingress-logs/ingress-logs?var-env=prod
{% endif %}

### Disable _your_ access logs

!!! note "Not recommended"
    Running without access logs is not recommended and will limit your ability to audit or debug connection problems with your application.

In some cases (such as legacy applications that are using personally identifiable information as URL parameters) you might want to disable access logs for a given application.
This can be done by using [HAProxy's `set-log-level` action][haproxy-set-log-level] via a [`backend-config-snippet`][haproxy-ingress-annotations] annotation in your nais yaml:

```yaml
apiVersion: nais.io/v1alpha1
kind: Application
metadata:
  name: myapplication
  namespace: myteam
  annotations:
    haproxy.org/backend-config-snippet: |
      http-request set-log-level silent
spec:
  ...
```

To keep personal identifiable information out of access logs use POST data instead or switch to user identifiers that are unique to your application or domain.

### Some debugging tips

If the HTTP status code from the response matches what your application returns, the issue is in your application, not the ingress controller.
Look in the logs for the corresponding application.

Here are some suggestions depending on what HTTP status code you might receive from the ingress controller:

| Code                      | Suggestion                                                                                                                                                                    |
| ------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `408 Request Timeout`     | The client did not send a complete request within the [`timeout http-request`][haproxy-timeout-http-request] deadline (not set by default, falls back to `timeout client`).   |
| `502 Bad Gateway`         | The backend returned an invalid response. This might be caused by large response headers (often cookies). You can investigate using the ingress access logs.                  |
| `503 Service Unavailable` | No healthy backend server is available to handle the request. Check that your application's health checks are passing.                                                        |
| `504 Gateway Timeout`     | The backend did not respond within the configured `timeout-server` period. Consider increasing `haproxy.org/timeout-server` if your application legitimately needs more time. |

## Full ingress example

=== "nais.yaml"

    ```yaml
    apiVersion: nais.io/v1alpha1
    kind: Application
    metadata:
      name: myapplication
      namespace: myteam
      annotations:
        haproxy.org/timeout-server: "300s"
    spec:
      service:
        protocol: http
      ingresses:
{%- if tenant() == "nav" %}
        - https://myapplication.nav.no
        - https://myapplication.intern.nav.no
{%- elif tenant() == "ssb" %}
        - https://myapplication.ssb.no
        - https://myapplication.intern.ssb.no
{%- elif tenant() == "atil" %}
        - https://myapplication.external.prod.atil.cloud.nais.io
        - https://myapplication.prod.atil.cloud.nais.io
{%- elif tenant() == "ldir" %}
        - https://myapplication.landbruksdirektoratet.no
        - https://myapplication.intern.landbruksdirektoratet.no
{%- elif tenant() == "test-nais" %}
        - https://myapplication.external.sandbox.test-nais.cloud.nais.io
        - https://myapplication.sandbox.test-nais.cloud.nais.io
{%- endif %}
    ```

=== "ingress.yaml"

    ```yaml
    apiVersion: networking.k8s.io/v1
    kind: Ingress
    metadata:
      name: myapplication-abcd1234
      namespace: myteam
      annotations:
        haproxy.org/timeout-server: "300s"   # copied from application annotations
    spec:
      ingressClassName: external-haproxy
      rules:
{%- if tenant() == "nav" %}
        - host: myapplication.nav.no
{%- elif tenant() == "ssb" %}
        - host: myapplication.ssb.no
{%- elif tenant() == "atil" %}
        - host: myapplication.external.prod.atil.cloud.nais.io
{%- elif tenant() == "ldir" %}
        - host: myapplication.landbruksdirektoratet.no
{%- elif tenant() == "test-nais" %}
        - host: myapplication.external.sandbox.test-nais.cloud.nais.io
{%- endif %}
          http:
            paths:
              - path: /
                pathType: Prefix
                backend:
                  service:
                    name: myapplication
                    port:
                      number: 80
    ---
    apiVersion: networking.k8s.io/v1
    kind: Ingress
    metadata:
      name: myapplication-efgh5678
      namespace: myteam
      annotations:
        haproxy.org/timeout-server: "300s"   # copied from application annotations
    spec:
      ingressClassName: internal-haproxy
      rules:
{%- if tenant() == "nav" %}
        - host: myapplication.intern.nav.no
{%- elif tenant() == "ssb" %}
        - host: myapplication.intern.ssb.no
{%- elif tenant() == "atil" %}
        - host: myapplication.prod.atil.cloud.nais.io
{%- elif tenant() == "ldir" %}
        - host: myapplication.intern.landbruksdirektoratet.no
{%- elif tenant() == "test-nais" %}
        - host: myapplication.sandbox.test-nais.cloud.nais.io
{%- endif %}
          http:
            paths:
              - path: /
                pathType: Prefix
                backend:
                  service:
                    name: myapplication
                    port:
                      number: 80
    ```
