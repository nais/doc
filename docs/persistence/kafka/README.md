# Kafka

NAV only uses Aiven hosted Kafka, the on-premis version of Kafka was disabled in 2021. Access to Kafka is granted by defining a `Topic` resource in one of our Kubernetes clusters.

Upon defining a Topic, [Kafkarator](https://github.com/nais/kafkarator) will create the Topic in one of the Kafka _pools_. A pool is a highly available, replicated Kafka cluster running at Aiven. After the topic is created, Kafkarator will add relevant users to the topic's access control list \(ACL\).

When an application that uses Kafka is deployed, [Aivenator](https://github.com/nais/aivenator) will orchestrate generation of users and credentials. These credentials are made available to applications through a _Secret_ in the relevant team namespace. This secret is automatically mounted by Naiserator into application pods as environment variables and files.

For a list of variables, see [accessing topics from an application](manage_topics.md#accessing-topics-from-an-application).

## Status and roadmap

* Release status: Generally Available
* Availability: NAIS GCP, NAIS on-premises, legacy infrastructure on-premises

Follow development on the [PIG-Aiven Trello board](https://trello.com/b/O0EvBshY/pig-aiven).
