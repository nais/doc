# Kafka

NAV uses Aiven hosted Kafka.
Start using Kafka by creating a `Topic` resource in one of our Kubernetes clusters.

Upon defining a Topic, [Kafkarator](https://github.com/nais/kafkarator) will create the Topic in one of the Kafka _pools_.
A pool is a highly available, replicated Kafka cluster running at Aiven.
After the topic is created, Kafkarator will add relevant users to the topic's access control list \(ACL\).

When an application that uses Kafka is deployed, [Aivenator](https://github.com/nais/aivenator) will orchestrate generation of users and credentials.
These credentials are made available to applications through a _Secret_ in the relevant team namespace.
This secret is automatically mounted by Naiserator into application pods as environment variables and files.

To get started, see [accessing topics from an application](manage_topics.md#accessing-topics-from-an-application).

!!! note "Backups and recovery"
    Kafka as a system is highly durable, and is designed to be able to keep your data safe in the event of a failure.
    This requires a properly configured replication factor for your topic, and that your clients use the appropriate strategy when sending messages and committing offsets.
    Even so, our recommendation is that Kafka should not be the master of your data, and you should have the ability to restore your data from some other system.
    

## Status and roadmap

* Release status: Generally Available
* Availability: NAIS GCP, NAIS on-premises, legacy infrastructure on-premises
