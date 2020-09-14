# Kafka

{% hint style="warning" %}
This feature applies only to _Aiven hosted Kafka_. On-premises Kafka will soon be deprecated.
For on-premises Kafka, see [on-premises Kafka documentation](https://confluence.adeo.no/display/AURA/Kafka).
{% endhint %}

{% hint style="danger" %}
Aiven hosted Kafka is currently in *CLOSED BETA*. Please contact the NAIS team
on the [#nais Slack channel](https://nav-it.slack.com/archives/C5KUST8N6) to
gain access to these features.

Serious battle testing has yet to be performed, be warned that this feature is
*NOT PRODUCTION READY* and should only be used for test and experimentation purposes.
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

For a list of variables, see _accessing topics from an application_ below.

## Creating topics and defining access

Creating or modifying this resource will trigger topic creation and ACL
management with Aiven (hosted Kafka provider).  The Topic resource must be
specified alongside the Application object. To add access to this topic for
your application, see the next section: _Accessing topics from an
application_.

Topic resources can only be specified in GCP clusters. However, applications
might access topics from any cluster, including on-premises. For details, read
the next section.

These pools are currently available:

| Pool | Topic declared in | Available from |
|---|---|---|
| `nav-dev` | `dev-gcp` | `dev-gcp`, `dev-fss`, `dev-sbs` |
| `nav-prod` | `prod-gcp` | `prod-gcp`, `prod-fss`, `prod-sbs` |

```yaml
---
apiVersion: kafka.nais.io/v1
kind: Topic
metadata:
  name: mytopic
  namespace: aura
  labels:
    team: aura
spec:
  pool: nav-dev
  config:  # optional; all fields are optional too; defaults shown
    cleanupPolicy: delete  # delete, compact
    minimumInSyncReplicas: 1
    partitions: 1
    replication: 3
    retentionBytes: -1
    retentionHours: 72
  acl:
    - team: aura
      application: ownerapp
      access: readwrite   # read, write, readwrite
    - team: bigteam
      application: consumerapp1
      access: read
    - team: bigteam
      application: consumerapp2
      access: read
    - team: bigteam
      application: producerapp1
      access: write
    - team: producerteam
      application: producerapp
      access: write
```

## Accessing topics from an application

Adding `.kafka.pool` to your `Application` spec will inject Kafka credentials into your pod.

Credentials may be rotated at any time. Make sure to read _application design constraints_ below.

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

### Application config

These variables are made available inside the pod.

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

## Application design constraints

Kafka requires TLS client certificates for authentication. Make sure your
Kafka and/or TLS library can do client certificate authentication.

The Kafka brokers present their own CA certificate. Your TLS library MUST
validate the Kafka brokers against this CA certificate.

The NAIS platform might rotate credentials at any time. This implies that your
application must handle errors concerning invalid credentials by either:

1. Reloading credentials from disk, then retrying the connection, and/or
2. terminate the application or report an unhealthy state.

As of now, there is no data migration path available. This is on our roadmap.
Specific details will be published after we collect enough information about
the desired scope of this feature.

## Auto-generated resources (for reference)

Configuration and credentials for producing to or consuming from the topic.
These will be automatically mounted in as environment variables in your pod;
see table above in _accessing topics from an application_.

```yaml
---
apiVersion: v1
kind: Secret
metadata:
  name: nav-dev-kafka-consumerapp-abcd1234  # procedurally generated from pool name, app name, and hash suffix
  namespace: aura
  labels:
    team: aura
data:
  KAFKA_BROKERS: broker1.aiven.io:12345,broker2.aiven.io:12345
  KAFKA_SCHEMA_REGISTRY: https://username:password@host1.aiven.io:32345,https://username:password@host2.aiven.io:32345
  KAFKA_CERTIFICATE: |
    ------ BEGIN CERTIFICATE ------
    PEM certificate data here.
    ------ END CERTIFICATE ------
  KAFKA_PRIVATE_KEY: |
    ------ BEGIN PRIVATE KEY ------
    PEM private key data here.
    ------ END CERTIFICATE ------
  KAFKA_CA: |
    ------ BEGIN CERTIFICATE ------
    PEM certificate authority data here.
    ------ END CERTIFICATE ------
```
