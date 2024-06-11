---
tags: [how-to, kafka]
---

# Kafka metrics
This guide will show you how to monitor your Kafka topics with Grafana.

This is a user-generated list of metrics that can be used with Grafana to monitor your Kafka topics.

Since you can use Kafka both from on-prem and GCP, the metrics are either read from the datasource where your app is running, or from the datasource where the topics belong (topics can only be created in GCP).
GCP apps will use the same datasource for all listed metrics.

## General tips
`kafka_producer_topic_record_send_total` is a good metric for the total amount of produced messages on a topic.

`kafka_consumer_fetch_manager_records_consumed_total` is a good metric for consumed messages of a topic.

`kafka_consumergroup_group_topic_sum_lag` can be used to follow the offset of a consumer group.

`kafka_server_BrokerTopicMetrics_MessagesInPerSec_Count` can be used to follow the number of messages produced for a topic.

`kafka_server_BrokerTopicMetrics_BytesInPerSec_Count` can be used to follow the amount of bytes produced for a topic.


## Metric examples

For watching how many messages are produced hourly on a specific topic:
```
sum(increase((kafka_producer_topic_record_send_total{topic="TOPIC"}[1h])))
```

For watching how many messages are consumed hourly on a specific topic:
```
sum(increase((kafka_consumer_fetch_manager_records_consumed_total{topic="TOPIC"}[1h])))
```

For following the topic offset for a consumer group:
```
sum(kafka_consumergroup_group_topic_sum_lag{topic="TOPIC",group="GROUP"})
```

Amount of messages on a topic per seconds:
```
sum by(topic) (rate(kafka_server_BrokerTopicMetrics_MessagesInPerSec_Count{topic="TOPIC"}[2m]))
```

Bytes produces on a topic per second:
```
sum by(topic) (rate(kafka_server_BrokerTopicMetrics_BytesInPerSec_Count{topic="TOPIC"}[2m]))
```

## Read more

[https://help.aiven.io/en/articles/3298562-kafka-metrics-through-prometheus-integration](https://help.aiven.io/en/articles/3298562-kafka-metrics-through-prometheus-integration)