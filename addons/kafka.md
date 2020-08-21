# Kafka

{% hint style="warning" %}
This feature applies only to _Aiven hosted Kafka_. On-premises Kafka is deprecated as of xx.xx.xxxx,
see [documentation for on-premises Kafka](...)
{% endhint %}

## Abstract

NAV uses Aiven hosted Kafka. Access to Kafka is granted by defining a `Topic`
resource in one of our Kubernetes clusters.

Upon defining a Topic, _Kafkarator_ will create the Topic in one of the Kafka
_pools_. A pool is a highly available, replicated Kafka cluster running at
Aiven. After the topic is created, Kafkarator will orchestrate generation of
users and credentials, and add the relevant users to the topic's access control
list (ACL). These credentials are made available to applications through a
_Secret_ in the relevant team namespace. This secret is automatically mounted
by Naiserator into application pods as environment variables.

| Variable name | Description |
|---|---|
| `KAFKA_BROKERS` | Comma-separated list of HOST:PORT pairs to Kafka brokers |
| `KAFKA_SCHEMA_REGISTRY` | Comma-separated list of URLs to schema registry |
| `KAFKA_CERTIFICATE_PATH` | Client certificate for connecting to the Kafka brokers, as file |
| `KAFKA_PRIVATE_KEY_PATH` | Client certificate key for connecting to the Kafka brokers, as file |
| `KAFKA_CA_PATH` | Certificate authority used to validate the Kafka brokers, as file |
| `KAFKA_CERTIFICATE` | Client certificate for connecting to the Kafka brokers, as string data |
| `KAFKA_PRIVATE_KEY` | Client certificate key for connecting to the Kafka brokers, as string data |
| `KAFKA_CA` | Certificate authority used to validate the Kafka brokers, as string data |

## Creating topics and defining access

Creating or modifying this resource will trigger topic creation and ACL
management with Aiven (hosted Kafka provider).  The Topic resource must be
specified alongside the Application object. To add access to this topic for
your application, see the next section: _Accessing a topic from an
application_.

```yaml
---
apiVersion: kafka.nais.io/v1alpha1
kind: Topic
metadata:
  name: mytopic
  namespace: aura
  labels:
    team: aura
spec:
  pool: default
  config:
    retention.ms: 100000
    kafka.partitions: 3
    cleanup.policy: never
  acl:
    - team: aura
      access: readwrite
    - team: otherteam
      access: readonly
```

## Accessing a topic from an application

Adding `.kafka.pool` to your `Application` spec will add a reference to the
Secret created by Kafkarator in all clusters.

```yaml
---
apiVersion: nais.io/v1alpha1
kind: Application
metadata:
  name: consumerapp
  namespace: myteam
  labels:
    team: myteam
spec:
  kafka:
    pool: nav-dev    # enum of nav-dev, nav-prod
```

### Auto-generated resources resulting from changes in Application spec

Configuration for producing to or consuming from the topic.  These will be
automatically mounted in as environment variables in your pod; see table above.

```yaml
---
apiVersion: v1
kind: Secret
metadata:
  name: nav-dev-kafka-configuration  # procedurally generated from pool name
  namespace: aura
  labels:
    team: aura
spec:
  KAFKA_BROKERS: broker1.aiven.io:12345,broker2.aiven.io:12345
  KAFKA_SCHEMA_REGISTRY: https://username:password@host1.aiven.io:32345,https://username:password@host2.aiven.io:32345
  KAFKA_CERTIFICATE_PATH: /var/run/secrets/kafka/kafka.crt
  KAFKA_PRIVATE_KEY_PATH: /var/run/secrets/kafka/kafka.key
  KAFKA_CA_PATH: /var/run/secrets/kafka/ca.crt
```

Credentials for producing to or consuming from the topic.  These will be
automatically mounted in as both environment variables and files in your pod;
see table above for reference.

```
---
apiVersion: v1
kind: Secret
metadata:
  name: nav-dev-kafka-credentials  # procedurally generated from pool name
  namespace: aura
  labels:
    team: aura
spec:
  KAFKA_CERTIFICATE: |
    ------ BEGIN CERTIFICATE ------
    ...
    ------ END CERTIFICATE ------
  KAFKA_PRIVATE_KEY: |
    ------ BEGIN PRIVATE KEY ------
    ...
    ------ END CERTIFICATE ------
  KAFKA_CA: |
    ------ BEGIN CERTIFICATE ------
    ...
    ------ END CERTIFICATE ------
```
