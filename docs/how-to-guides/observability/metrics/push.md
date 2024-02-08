---
description: Push metrics to Prometheus
tags: [guide]
---
# Push metrics to Prometheus

This how-to guide shows you how to push metrics from your application using the Prometheus Pushgateway.
This is typically used in NAIS jobs, which by it's nature often is short-lived and cannot effectively be scraped by Prometheus.

Prometheus has further explanations and examples [here](https://prometheus.io/docs/instrumenting/pushing/)

## 1. Add pushgateway and accessPolicy to your manifest

???+ note ".nais/naisjob.yaml"

    ```yaml hl_lines="11-18"
    apiVersion: nais.io/v1
    kind: Naisjob
    metadata:
    labels:
        team: <MY-TEAM>
    name: <MY-JOB>
    namespace: <MY-TEAM>
    spec:
    image: {{image}}
    schedule: "*/1 * * * *"
    env:
        - name: PUSH_GATEWAY_ADDRESS
        value: prometheus-pushgateway.nais-system:9091
    accessPolicy:
        outbound:
        rules:
            - application: prometheus-pushgateway
            namespace: nais-system
    ```

## 2. Send metrics to your application

```java
package io.prometheus.client.it.pushgateway;

import io.prometheus.client.CollectorRegistry;
import io.prometheus.client.Gauge;
import io.prometheus.client.exporter.BasicAuthHttpConnectionFactory;
import io.prometheus.client.exporter.PushGateway;

public class ExampleBatchJob {
    public static void main(String[] args) throws Exception {
        String jobName = "my_batch_job";
        String pushGatewayAddress = System.getenv("PUSH_GATEWAY_ADDRESS");

        CollectorRegistry registry = new CollectorRegistry();
        Gauge duration = Gauge.build()
                .name("my_batch_job_duration_seconds")
                .help("Duration of my batch job in seconds.")
                .register(registry);
        Gauge.Timer durationTimer = duration.startTimer();
        try {
            Gauge lastSuccess = Gauge.build()
                    .name("my_batch_job_last_success")
                    .help("Last time my batch job succeeded, in unixtime.")
                    .register(registry);
            lastSuccess.setToCurrentTime();
        } finally {
            durationTimer.setDuration();
            PushGateway pg = new PushGateway(pushGatewayAddress);
            pg.pushAdd(registry, jobName);
        }
    }
}
```
