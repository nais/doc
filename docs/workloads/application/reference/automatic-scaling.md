# Automatic Scaling

As part of the nais platform, the Application resource supports two types of scaling:

* CPU based scaling
* Scaling based on Kafka Consumer Lag

## CPU based scaling

If you specify a minimum and maximum number of replicas in your Application resource, the default behavior is to scale up when your CPU usage exceeds 50% of your requested usage.
To change the threshold, set `replicas.scalingStrategy.cpu.thresholdPercentage` to a different value.

## Scaling based on Kafka Consumer Lag

If you want to use Kafka Consumer Lag as a scaling metric, you have to specify the following fields in your Application resource:

```yaml
replicas:
  min: <minimum-number-of-replicas>
  max: <maximum-number-of-replicas>
  scalingStrategy:
    kafka:
      topic: <topic-name>
      consumerGroup: <consumer-group-name>
      threshold: <threshold>
```

The threshold is the maximum offset lag before scaling up.
Keep in mind that for Kafka, the maximum number of replicas is limited by the number of partitions in the topic.
If you have a topic with 10 partitions, you can only scale up to 10 replicas.

## Combining scaling strategies

If you define both a CPU threshold and a Kafka Consumer Lag threshold, the application will scale up if either of the thresholds are exceeded.

## Custom scaling

!!! warning
    
    In order to use custom scaling policies and rules, make sure you disable default NAIS HPA by setting the [`.spec.replicas.disableAutoScaling`](application-spec.md#replicasdisableautoscaling) field to `true`. 


### Scaling based on custom metrics

A custom metric is based on a direct value or a rate over time.
To make the custom metric available for scaling, you have to label it with either hpa="value" or hpa="rate"

Example metric output:
```
# HELP active_sessions number of active sessions
# TYPE active_sessions gauge
active_sessions{hpa="value"} 100
# HELP documents_received how many documents have we received
# TYPE documents_received counter
documents_received{hpa="rate"} 69
```

Once the metric is labelled correctly, it can be used in a HorizontalPodAutoscaler Kubernetes object.
Refer to the [Kubernetes documentation](https://kubernetes.io/docs/tasks/run-application/horizontal-pod-autoscale/) for details.

In the example below, the amount of replicas will be increased once the average of `active_sessions` exceeds 150 across all currently running pods.

```yaml
apiVersion: autoscaling/v2
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
        averageValue: "150"
```

### Scaling based on external metrics

External metrics are provided by the platform for services external to the application, i.e. Kafka lag.
If you want your application to scale based on external metrics, replace the metrics section of the previous example with the one below.

This example will scale up your application if the maximum lag of your consumer group exceeds 120 seconds.

```yaml
 metrics:
  - type: External
    external:
      metric:
        name: kafka_consumergroup_group_max_lag_seconds
        selector:
          matchLabels:
            topic: your-topic
            group: your-consumer-group
      target:
        type: AverageValue
        averageValue: "120"
```

### Available metrics

Use this command to see a list of available external metrics:

```kubectl get --raw "/apis/external.metrics.k8s.io/v1beta1" | jq .```
