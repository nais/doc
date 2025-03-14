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
A list of supported variables are specified in the [Nginx ingress documentation][nginx-ingress-annotations].

[kubernetes-annotations]: https://kubernetes.io/docs/concepts/overview/working-with-objects/annotations/
[nginx-ingress-annotations]: https://kubernetes.github.io/ingress-nginx/user-guide/nginx-configuration/annotations/
[service-discovery]: ../../how-to/communication.md

### Custom max body size

For nginx, an `413` error will be returned to the client when the size in a request exceeds the maximum allowed size of the client request body. By default, this is set to `1m` (1 megabyte).

```yaml
metadata:
  annotations:
    nginx.ingress.kubernetes.io/proxy-body-size: "8m"
```

### Custom proxy buffer size

Sets the size of the buffer proxy_buffer_size used for reading the first part of the response received from the proxied server. By default proxy buffer size is set as `4k`

```yaml
metadata:
  annotations:
    nginx.ingress.kubernetes.io/proxy-buffer-size: "8k"
```

### Custom timeouts

In some scenarios is required to have different values for various timeouts. To allow this we provide parameters that allows this customization:

* `nginx.ingress.kubernetes.io/proxy-connect-timeout`
* `nginx.ingress.kubernetes.io/proxy-send-timeout`
* `nginx.ingress.kubernetes.io/proxy-read-timeout`
* `nginx.ingress.kubernetes.io/proxy-next-upstream`
* `nginx.ingress.kubernetes.io/proxy-next-upstream-timeout`
* `nginx.ingress.kubernetes.io/proxy-next-upstream-tries`
* `nginx.ingress.kubernetes.io/proxy-request-buffering`

Note: All timeout values are unitless and in seconds e.g. `nginx.ingress.kubernetes.io/proxy-read-timeout: "120"` sets a valid 120 seconds proxy read timeout.

## WebSockets Support

Support for websockets is provided by nginx ingress controller out of the box. No special configuration required.

The only requirement to avoid the close of connections is the increase of the values of `proxy-read-timeout` and `proxy-send-timeout`.

The default value of this settings is `60 seconds`.

A more adequate value to support websockets is a value higher than one hour (`3600`).

```yaml
apiVersion: nais.io/v1alpha1
kind: Application
metadata:
  name: myapplication
  namespace: myteam
  annotations:
    nginx.ingress.kubernetes.io/proxy-read-timeout: "600"
    nginx.ingress.kubernetes.io/proxy-send-timeout: "600"
spec:
  ...
```

## Metrics

All requests to your application via ingress will result in metrics being emitted to Prometheus. The metrics are prefixed with `nginx_ingress_controller_requests_` and are tagged with the following labels: `status`, `method`, `host`, `path`, `namespace`, `service`.

??? info "Ingress metrics label descriptions"

    | Label       | Description                    |
    | ----------- | ------------------------------ |
    | `status`    | HTTP status code               |
    | `method`    | HTTP method                    |
    | `host`      | Host header (domain)           |
    | `path`      | Request path                   |
    | `namespace` | Namespace of the ingress       |
    | `service`   | Name of the service (app name) |

### Uptime probes

All ingresses will automatically have uptime probes enabled on them. This probe will directed at the [application's readiness endpoint](application-spec.md#readiness) using a HTTP GET request. A probe is considered successful if the HTTP status code is `2xx` or `3xx`. The probe is considered failed if the HTTP status code is `4xx` or `5xx`.

You can query the uptime probe status using the following PromQL query:

```promql
probe_success{app="my-app"} == 1
```

### Example PromQL Queries

Number of requests to the `myapp` application, grouped by status code:

```promql
sum by (status) (nginx_ingress_controller_requests{service="myapp", namespace="myteam"})
```

Number of `5xx` errors to the `myapp` application:

```promql
sum(nginx_ingress_controller_requests{service="myapp", namespace="myteam", status=~"5.."})
```

Percentage of `5xx` errors to the `myapp` application as a ratio of total requests:

```promql
100 * (
  sum by (service) (rate(nginx_ingress_controller_requests{status=~"^5\\d\\d", namespace="myteam", service="myapp"}[3m]))
  /
  sum by (service) (rate(nginx_ingress_controller_requests{namespace="myteam", service="myapp"}[3m]))
)
```

## Ingress access logs

Ingress access logs are enabled by default for all applications and accessible from [Grafana Log Explorer](https://grafana.<<tenant()>>.cloud.nais.io/a/grafana-lokiexplore-app/explore) by selecting the `nais-ingress` service.

From there you can use the Filter tab to search for logs from your application by using the `ingress_namespace`, `ingress_name` and `url_domain` labels.

{% if tenant() == "nav" %}

Ingress logs for on-premise applications are available in Kibana.
Here are pre-configured queries for ingress logs in the different environments:

| Kibana                      | Grafana Loki              |
| --------------------------- | ------------------------- |
| [dev-gcp][dev-gcp-kibana]   | [dev-gcp][dev-gcp-loki]   |
| [prod-gcp][prod-gcp-kibana] | [prod-gcp][prod-gcp-loki] |
| [dev-fss]                   | -                         |
| [prod-fss]                  | -                         |

[dev-gcp-kibana]: https://logs.adeo.no/app/discover#/view/1638d780-3369-11ed-b3e8-d969437dd878?_g=()
[prod-gcp-kibana]: https://logs.adeo.no/app/discover#/view/1d10b410-3369-11ed-b3e8-d969437dd878?_g=()
[dev-fss]: https://logs.adeo.no/app/discover#/view/e7562030-3368-11ed-b3e8-d969437dd878?_g=()
[prod-fss]: https://logs.adeo.no/app/discover#/view/00c05220-3369-11ed-b3e8-d969437dd878?_g=()
[dev-gcp-loki]: https://grafana.nav.cloud.nais.io/d/ingress-logs/ingress-logs?var-env=dev
[prod-gcp-loki]: https://grafana.nav.cloud.nais.io/d/ingress-logs/ingress-logs?var-env=prod
{% endif %}

### Disable _your_ access logs

!!! note "Not reccomended"
    Running without access logs is not reccomended and will limit your ability to audit or debug connection problems with your application.

In some cases (such as legcay applications that are using personally identifiable information as URL parameters) you might want to disable access logs for a given application. This can be done by setting the following annotation in your nais yaml:

```yaml
apiVersion: nais.io/v1alpha1
kind: Application
metadata:
  name: myapplication
  namespace: myteam
  annotations:
    nginx.ingress.kubernetes.io/enable-access-log: "false"
spec:
  ...
```

To keep personal identifiable information out of access logs use POST data instead or switch to user identifiers that are unique to your application or domain.

### Some debugging tips

If `response_code` and `x_upstream_status` are the same it means that the application returned this response code – not nginx. Look in the logs for the corresponding application, this is not a problem with nginx.

Here are some suggestions depending on what http status code you might recieve from nginx:

| Code                           | Suggestion                                                                                                                                                                                                                                               |
| ------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `400 Bad Request`              | If nginx returns `401` error with no further explanation and there is no `x_upstream_name` it means that nginx received an invalid request before it could be sent to the backend. One of the most common problems is duplicate `Authorization` headers. |
| `413 Request Entity Too Large` | If nginx return `413` error it means that the request body is too large. This can be caused by a large file upload or a large request body. The solution is to add the `proxy-body-size` ingress parameter to an appropriate size.                       |
| `502 Bad Gateway`              | If nginx return `502` error but the application is returning a `2xx` status code it might be caused by large response headers often cookies. The solution is the add the `proxy-buffer-size` to an appropriate size.                                     |

## Full ingress example

=== "nais.yaml"

    ```yaml
    apiVersion: nais.io/v1alpha1
    kind: Application
    metadata:
      name: myapplication
      namespace: myteam
      annotations:
        nginx.ingress.kubernetes.io/proxy-body-size: "256M"
        nginx.ingress.kubernetes.io/proxy-buffer-size: "8k"
        nginx.ingress.kubernetes.io/proxy-read-timeout: "300"
    spec:
      service:
        protocol: http
      ingresses:
        - https://myapplication.nav.no
    ```

=== "ingress.yaml"

    ```yaml
    apiVersion: extensions/v1beta1
    kind: Ingress
    metadata:
      name: myapplication-gw-nav-no-abcd1234
      namespace: myteam
      annotations:
        nginx.ingress.kubernetes.io/backend-protocol: "HTTP"    # from ".service.protocol"
        nginx.ingress.kubernetes.io/use-regex: "true"           # this is always on
        nginx.ingress.kubernetes.io/proxy-body-size: "256M"     # copied from annotations
        nginx.ingress.kubernetes.io/proxy-buffer-size: "8k"     # copied from annotations
        nginx.ingress.kubernetes.io/proxy-read-timeout: "300"   # copied from annotations
    ```