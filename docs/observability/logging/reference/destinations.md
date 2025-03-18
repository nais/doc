
---
title: Log Destinations
description: Available log destinations for application logging in Nais.
tags: [reference, logging]
conditional: [tenant, nav]
---

# Log Destinations

Log destinations are the different places where logs can be sent to. All environments have a default log destination, please see the [environments overview](../../../workloads/reference/environments.md), but you can configure your application to send logs to other destinations as well.

## Configuration

To configure a log destination for your application, add the following configuration to your `Application` resource:

```yaml
apiVersion: nais.io/v1alpha1
kind: Application
metadata:
  name: my-application
spec:
  observability:
    logging:
      destinations:
        - loki
```

## Destinations

The following log destinations are available in Nais:

{% if tenant() != "ssb" %}
- [`loki`](../how-to/loki.md#enable-logging-to-grafana-loki)
{% endif %}
{% if tenant() == "nav" %}
- [`elastic`](../how-to/kibana.md#enable-logging-to-elastic-kibana)
- [`secure_logs`](../how-to/enable-secure-logs.md)
{% endif %}
- [`[]`](../how-to/disable.md) (disabled)
