---
tags: [local-retention, tiered-storage, kafka, explanation]
---

# Tiered storage

Tiered storage is a way to offload rarely used messages to a cheaper, remote storage.
Using tiered storage allow storing more data in a more cost-effective way.
New messages can be stored locally on the Kafka broker, while old messages will be stored remotely.
The ratio of local to remote can be configured per topic.

When using remote storage, cluster maintenance will be more efficient as less data needs to be transferred between brokers.
With less data locally we can run smaller sized brokers.

See [the how-to documentation for tiered storage](../how-to/tiered-storage.md) for how to enable tiered storage for your kafka topic.

## Local vs. remote data retention

When using tiered storage you need to decide how much retention you need to keep locally, for low latency retrieval, and what can be stored remotely.
The active segment will always be stored locally, meaning that if you set your local retention to less than the segment size, the active segment will be you local retention.

![How the sum of retention is distributed between remote and local storage](/assets/tiered-storage.svg)

The value in [`retention`](../../reference/kafka-topic-spec.md#configretentionbytes) is the total retention, where [`localRetention`](../../reference/kafka-topic-spec.md#configlocalretentionbytes) describes what is minimally in local storage.
If `localRetention` is not set, all retention is local.

If you have once set `localRetention`, you can not turn off remote storage.
This means that all your data will be stored both locally and remotely.

It may also be interesting to know that segments will be moved to remote storage continuously when it is no longer the active segment, it will still be stored locally, and only deleted when the local retention expires.

## Trade-offs and limitations

- Remote access has a higher latency than local access.
- After tiered storage is enabled, you cannot disable it.
- Tiered storage does not support compacted topics.
- Remote storage can not be moved back to local storage.

## Further reading

- [Tiered storage in Aiven Kafka](https://aiven.io/docs/products/kafka/concepts/kafka-tiered-storage)
- [How tiered storage works in Aiven Kafka](https://aiven.io/docs/products/kafka/concepts/tiered-storage-how-it-works)
- [Trade-offs and limitations](https://aiven.io/docs/products/kafka/concepts/tiered-storage-limitations)
