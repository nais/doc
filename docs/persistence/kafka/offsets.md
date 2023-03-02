# Working with Kafka Offsets

## Retention and what it means

On Aiven Kafka, we retain consumer offsets for a period of 7 days.
This is the period recommended by Aiven and the default for Kafka.
This is in contrast to On-Prem Kafka, where we have retained consumer offsets for several months.
Due to how longer offset retention affects other parts of Kafka, we do not want to increase this period.

When a consumer group stops consuming messages, its offsets will be retained for the mentioned period.

How Kafka decides if a consumer group has stopped comes in two variations:

### Dynamically assigned partitions

This is the normal operation when using current Kafka client libraries.
In this case, Kafka assigns partitions to the consumers as they connect, and manages group membership.
A consumer group is considered empty when there are no connected consumers with assigned partitions.

Once the group is empty, Kafka retains the offsets for 7 days.

### Manually assigned partitions

When using the [`assign`][assign] API you are responsible for keeping track of consumers.
In this scenario, Kafka uses the time of the last commit to determine offset retention.

Offsets are kept for 7 days after the last commit.

!!! warning
    This means that when using manual assignment on a topic with long periods of inactivity (more than 7 days between messages),
    you might lose offsets even if your consumer is running and committing offsets as it should.

## Do you even need offsets?

Some scenarios don't actually need to track offsets, and can consider disabling the feature for a slight performance gain.
In these situations, you can set `enable.auto.commit=false`, and simply not commit offsets.

There are two main variations of this scenario:

1. Always reading the entire topic from start to end. Set `auto.offset.reset=earliest`.
2. Only caring about fresh messages arriving after the consumer connects. Set `auto.offset.reset=latest`.

## Autocommit: When/Why/Why not?

When starting out with Kafka, it is common to use the autocommit feature available in the client libraries.
This makes it easy to get started, and often provides good enough semantics.

When you use autocommit, the client will automatically commit the last received offsets at a set interval, configured using `auto.commit.interval.ms`.
The implementation ensures that you get "at-least-once" semantics, where the worst case scenario is to reprocess messages received in the interval between last commit and the consumer stopping.
One downside with this mechanism is that you have little control over when offsets are committed.

Autocommit is done before a `poll` to the server, which means that your consumer needs to ensure that has completed processing of a message before the next call to `poll`.
If your consumer processes messages in other threads, you probably need to manage offsets explicitly and not rely on autocommit.

### Managing offsets explicitly

The KafkaConsumer exposes two APIs for committing offsets.
[Asynchronous commits using `commitAsync`][commitAsync] and [synchronous commits using `commitSync`][commitSync].

From the [Confluent documentation][offset-management]:

> Each call to the commit API results in an offset commit request being sent to the broker. Using the synchronous API, the consumer is blocked until that request returns successfully. This may reduce overall throughput since the consumer might otherwise be able to process records while that commit is pending.
> 
> ---
> 
> A second option is to use asynchronous commits. Instead of waiting for the request to complete, the consumer can send the request and return immediately by using asynchronous commits.
> 
> ---
> 
> In general, asynchronous commits should be considered less safe than synchronous commits.


## Saving offsets elsewhere

The consumer application need not use Kafka's built-in offset storage, it can store offsets in a store of its own choosing.
The primary use case for this is allowing the application to store both the offset and the results of the consumption in the same system in a way that both the results and offsets are stored atomically.
Another use case is when you have consumers that receive messages very rarely, where consumer inactivity and other incidents might lead to lost offsets because of shorter retention.

In some cases it might even be beneficial to store offsets in alternative storage even if your messages are not.
This will avoid issues with offsets passing beyond the retention threshold, in case of recurring errors or networking issues.

When storing offsets outside Kafka, your consumer needs to pay attention to rebalance events, to ensure correct offset management.
In these cases it might be easier to also [manage partition assignment explicitly](#manually-assigned-partitions).

Before storing offsets outside Kafka, consult the [Kafka documentation][rebalance] on the topic.

## What to do when you lose your offsets

Shit happens, and you may experience lost offsets even if you've done everything right.
In these cases, having a good plan for recovery can be crucial.
Depending on your application, there are several paths to recovery, some more complicated than others.

In the best of cases, you can simply start your consumer from either `earliest` or `latest` offsets and process normally.
If you can accept reprocessing everything, set `auto.offset.reset=earliest`.
If you can accept missing a few messages, set `auto.offset.reset=latest`.
If neither of those are the case, your path becomes more complicated, and it is probably best to set `auto.offset.reset=none`.

If you need to assess or manually handle the situation before continuing, setting `auto.offset.reset` to `none` will make your application fail immediately after offsets are lost.
Trying to recover from lost offsets are considerably more complicated after your consumer has been doing the wrong thing for an hour.

If you don't want to start at either end, but have a reasonable estimate of where your consumer stopped, you can use the [`seek`][seek] API to jump to the wanted offset before starting your consumer.

You can also update consumer offsets using the Kafka command-line tool `kafka-consumer-groups.sh`. 
Aiven has written a short [article][aiven-offset-help] about its usage, that is a great place to start.
In order to use it you need credentials giving you access to the topic, which you can get using the [nais cli](/cli/commands/aiven/).

For other strategies, post a message in [#kafka](https://nav-it.slack.com/archives/C73B9LC86) on slack, and ask for help.
Several teams have plans and tools for recovery that they can share.

### Getting estimates for last offset

Finding a good estimate for where your last offset was can be tricky.

One place to go is Prometheus.
In our clusters, we have kafka-lag-exporter running.
This tracks various offset-related metrics, one of which is the last seen offset for a consumer group.

You can use this query to get offsets for a consumer group:

[max(kafka_consumergroup_group_offset{group="spedisjon-v1"}) by (topic, partition)](https://prometheus.dev-gcp.nav.cloud.nais.io/graph?g0.expr=max(kafka_consumergroup_group_offset%7Bgroup%3D%22spedisjon-v1%22%7D)%20by%20(topic%2C%20partition)&g0.tab=1&g0.stacked=0&g0.show_exemplars=0&g0.range_input=1h)


<!-- Long links moved here for better text flow -->
[assign]: https://kafka.apache.org/28/javadoc/org/apache/kafka/clients/consumer/KafkaConsumer.html#assign(java.util.Collection)
[commitAsync]: https://kafka.apache.org/28/javadoc/org/apache/kafka/clients/consumer/KafkaConsumer.html#commitAsync()
[commitSync]: https://kafka.apache.org/28/javadoc/org/apache/kafka/clients/consumer/KafkaConsumer.html#commitSync()
[offset-management]: https://docs.confluent.io/platform/current/clients/consumer.html#offset-management
[rebalance]: https://kafka.apache.org/28/javadoc/org/apache/kafka/clients/consumer/KafkaConsumer.html#rebalancecallback
[seek]: https://kafka.apache.org/28/javadoc/org/apache/kafka/clients/consumer/KafkaConsumer.html#seek(org.apache.kafka.common.TopicPartition,long)
[aiven-offset-help]: https://developer.aiven.io/docs/products/kafka/howto/viewing-resetting-offset
