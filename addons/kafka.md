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

## Status and roadmap

* Release status: CLOSED BETA
* Availability: GCP, on-premises

Follow development on the [PIG-Kafka Trello board](https://trello.com/b/O0EvBshY/pig-kafka).

Major features coming:

* Live data migration from on-premises to Aiven
* Custom pools for teams with large amounts of data

## Creating topics and defining access

Creating or modifying this resource will trigger topic creation and ACL
management with Aiven (hosted Kafka provider).  The Topic resource must be
specified alongside the Application object. To add access to this topic for
your application, see the next section: _Accessing topics from an
application_.

Topic resources can only be specified in GCP clusters. However, applications
might access topics from any cluster, including on-premises. For details, read
the next section.

Currently, use the `nav-dev` pool for development, and `nav-prod` for production.

| Pool | Min. replication | Max. replication | Topic declared in | Available from |
|---|---|---|
| `nav-dev` | 2 | 3 | `dev-gcp` | `dev-gcp`, `dev-fss`, `dev-sbs` |
| `nav-prod` | 2 | 3 | `prod-gcp` | `prod-gcp`, `prod-fss`, `prod-sbs` |

{% code-tabs %}
{% code-tabs-item title="topic.yaml" %}
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
    replication: 3  # see min/max requirements
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
{% endcode-tabs-item %}
{% endcode-tabs %}

### Data Catalog metadata

If your topic exposes data meant for consumption by a wider audience, you
should define some metadata describing the topic and its contents. This data
will be automatically scraped and added to the [internal data catalog](https://data.adeo.no). 
If the 'catalog' key is set to 'Public' then the topic metadata is also published to the [external data catalog](https://data.nav.no) and the [common data catalog](https://data.norge.no/).
Use the following annotations and prefix them with `dcat.data.nav.no/`. Default values will be used where not supplied.

Syntax:

```
apiVersion: kafka.nais.io/v1
kind: Topic
metadata:
  annotations:
    dcat.data.nav.no/<key>: "<value>"
```

| Key | Importance | Comment | Example Value | Default value |
|---|---|---|---|---|
| title | mandatory | String | Inntektskjema mottatt fra Altinn | *topic name* |
| description | mandatory | String | Inntektsmeldingen arbeidsgiveren sender fra eget lønns- og personalsystem eller fra altinn.no | |
| theme | recommended | A main category of the resource. A resource can have multiple themes entered as a comma-separated list if strings. | inntekt | |
| keyword | recommended | A string or a list of strings | inntekt, arbeidsgiver,altinn | |


One or more of the following keys can also be supplied if the default values are not relevant

| Key | Importance | Comment | Example Value | Default value |
|---|---|---|---|---|
| temporal | optional | An interval of time covered by the topic that is named or defined by its start and end date. Formatted as 2 ISO 8601 dates (or datetimes) separated by a slash | 2020/2020 or 2020-06/2020-06 | *current year*/*current year* |
| creator | optional | The entity responsible for producing the resource. An agent (eg. person, group, software or physical artifact) | NAV | *team name* |
| language | optional | 2 or 3 letter code | NO | NO |
| publisher | optional | The entity responsible for making the item available. An agent (eg. person, group, software or physical artifact). | NAV | NAV | 
| accessRights | optional | Information about who can access the resource or an indication of its security status. | Internal | Internal |
| license | optional | Either a license URI or a title | MIT |  |
| rights | optional | A statement that concerns all rights not addressed with dct:license or dct:accessRights, such as copyright statements. | Copyright 2020, NAV |  Copyright *year*, NAV |
| catalog | optional | The catalog(s) where the metadata will be published. The value can be either 'Internal' or 'External' | External |  Internal |

## Accessing topics from an application

Adding `.kafka.pool` to your `Application` spec will inject Kafka credentials into your pod.
Your application needs to follow some design guidelines; see the next section on _application design guidelines_.

{% code-tabs %}
{% code-tabs-item title="nais.yaml" %}
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
{% endcode-tabs-item %}
{% endcode-tabs %}

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

## Application design guidelines

The NAIS platform might rotate credentials at any time. This implies that your
application must handle errors concerning invalid credentials by either:

1. reloading credentials from disk, then retrying the connection, or
2. trigger a restart by either terminating the application or reporting an unhealthy state.

Kafka requires TLS client certificates for authentication. Make sure your
Kafka and/or TLS library can do client certificate authentication, and that you can
specify a custom CA certificate for server validation.

## FAQ

* Q: why do I have to specify a pool name if there is only `nav-dev` and `nav-prod`?
  A: custom pools will be added in the future.
