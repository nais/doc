# Automatic Scaling

!!! warning
    
    In order to use custom scaling policies and rules, make sure you disable default NAIS HPA by setting spec.replicas.min == spec.replicas.max 
    Scaling based on custom and external metrics is only available in GCP.


## Scaling based on custom metrics
A custom metric is based on a direct value or a rate over time.
To make the custom metric available for scaling, you have to label it with either hpa="value" or hpa="rate"

example metric output:
```
# HELP active_sessions number of active sessions
# TYPE active_sessions gauge
active_sessions{hpa="value"} 100
# HELP documents_received how many documents have we received
# TYPE documents_received counter
documents_received{hpa="rate"} 69
```

Once the metric is labelled correctly, it can be used in a HorizontalPodAutoscaler Kubernetes object.
Refer to the [https://kubernetes.io/docs/tasks/run-application/horizontal-pod-autoscale/](Kubernetes documentation) for details.

In the example below, the amount of replicas will be increased once the average of "active_sessions" exceeds 150 across all currently running pods.
```YAML
apiVersion: autoscaling/v2beta2
kind: HorizontalPodAutoscaler
metadata:
  name: hpa-example
  namespace: team-namespace
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: deployment-name
  minReplicas: 2
  maxReplicas: 10
  metrics:
  - type: Pods
    pods:
      metric:
        name: active_sessions
      target:
        type: AverageValue
        averageValue: 150
```
!!! info
  The platform provides metrics from the LinkerD sidecar by default: `linkerd_request_total`.
  This metric contains the rate of inbound requests

## Scaling based on external metrics.
External metrics are provided by the platform for services external to the application, i.e. Kafka lag.
If you want your application to scale based on external metrics, replace the metrics section of the previous example with the one below.

```
 metrics:
  - type: External
    external:
      metric:
        name: kafka_consumergroup_group_lag
        selector:
          matchLabels:
            topic: your-topic
            group: your-consumer-group
      target:
        type: AverageValue
        averageValue: 10000
```

## Scaling behaviour
You can also override the default behaviour of the autoscaler by configuring the HPA
See [Kubernetes documentation](https://kubernetes.io/docs/tasks/run-application/horizontal-pod-autoscale/) for details
