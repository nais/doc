# Kafka

!!! warning
    This feature applies only to _Aiven hosted Kafka_. On-premises Kafka is deprecated, and creating new topics on-premises was disabled summer 2021. For on-premises Kafka, see [on-premises Kafka documentation](https://confluence.adeo.no/display/AURA/Kafka).

## Abstract

NAV uses Aiven hosted Kafka. Access to Kafka is granted by defining a `Topic` resource in one of our Kubernetes clusters.

Upon defining a Topic, [Kafkarator](https://github.com/nais/kafkarator) will create the Topic in one of the Kafka _pools_. A pool is a highly available, replicated Kafka cluster running at Aiven. After the topic is created, Kafkarator will add relevant users to the topic's access control list \(ACL\).

When an application that uses Kafka is deployed, [Aivenator](https://github.com/nais/aivenator) will orchestrate generation of users and credentials. These credentials are made available to applications through a _Secret_ in the relevant team namespace. This secret is automatically mounted by Naiserator into application pods as environment variables and files.

For a list of variables, see [accessing topics from an application](#accessing-topics-from-an-application) below.

## Status and roadmap

* Release status: Generally Available
* Availability: NAIS GCP, NAIS on-premises, legacy infrastructure on-premises

Follow development on the [PIG-Aiven Trello board](https://trello.com/b/O0EvBshY/pig-aiven).


## Creating topics and defining access

Creating or modifying a `Topic` Kubernetes resource will trigger topic creation and ACL management with Aiven \(hosted Kafka provider\). The topic name will be prefixed with your team namespace, thus in the example below, the fully qualified topic name will be `myteam.mytopic`. This name will be set in the `.status.fullyQualifiedName` field on your Topic resource once the Topic is synchronized to Aiven.

To add access to this topic for your application, see the next section: _Accessing topics from an application_.

Topic resources can only be specified in GCP clusters. However, applications might access topics from any cluster, including on-premises. For details, read the next section.

Currently, use the `nav-dev` pool for development, and `nav-prod` for production.
If you need cross-environment communications, use the `nav-infrastructure` pool, but please consult the NAIS team before you do.

| Pool | Min. replication | Max. replication | Topic declared in | Available from |
| :--- | :--- | :--- | :--- | :--- |
| `nav-dev` | 2 | 3 | `dev-gcp` | `dev-gcp`, `dev-fss`, `dev-sbs` |
| `nav-prod` | 2 | 3 | `prod-gcp` | `prod-gcp`, `prod-fss`, `prod-sbs` |
| `nav-infrastructure` | 2 | 3 | `prod-gcp` | `dev-gcp`, `dev-fss`, `dev-sbs`, `prod-gcp`, `prod-fss`, `prod-sbs` |


=== "topic.yaml"
    ```yaml
    ---
    apiVersion: kafka.nais.io/v1
    kind: Topic
    metadata:
      name: mytopic
      namespace: myteam
      labels:
        team: myteam
    spec:
      pool: nav-dev
      config:  # optional; all fields are optional too; defaults shown
        cleanupPolicy: delete  # delete, compact, compact,delete
        minimumInSyncReplicas: 1
        partitions: 1
        replication: 3  # see min/max requirements
        retentionBytes: -1  # -1 means unlimited
        retentionHours: 72  # -1 means unlimited
      acl:
        - team: myteam
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

### Data catalog metadata

If your topic exposes data meant for consumption by a wider audience, you should define some metadata describing the topic and its contents. This data will be automatically scraped and added to the [internal data catalog](https://data.adeo.no). If the `catalog` key is set to `public`, the topic metadata is also published to the [external data catalog](https://data.nav.no) and the [National Data Catalog](https://data.norge.no/).

Syntax:

=== "topic.yaml"
    ```
    apiVersion: kafka.nais.io/v1
    kind: Topic
    metadata:
      annotations:
        dcat.data.nav.no/<key>: "<value>"
    ```

Use the following annotations and prefix them with `dcat.data.nav.no/`. Default values will be used where not supplied.

| Key | Importance | Comment | Example Value |  |
| :--- | :--- | :--- | :--- | :--- |
| title | mandatory | String | Inntektskjema mottatt fra Altinn | _topic name_ |
| description | mandatory | String | Inntektsmeldingen arbeidsgiveren sender fra eget lønns- og personalsystem eller fra altinn.no |  |
| theme | recommended | A main category of the resource. A resource can have multiple themes entered as a comma-separated list of strings. | inntekt |  |
| keyword | recommended | A string or a list of strings | inntekt,arbeidsgiver,altinn |  |

One or more of the following keys can also be supplied if the default values below are not sufficient:

| Key | Importance | Comment | Example Value | Default value |
| :--- | :--- | :--- | :--- | :--- |
| temporal | optional | An interval of time covered by the topic, start and end date. Formatted as two ISO 8601 dates \(or datetimes\) separated by a slash. | 2020/2020 or 2020-06/2020-06 | _current year_/_current year_ |
| language | optional | Two or three letter code. | NO | NO |
| creator | optional | The entity responsible for producing the topic. An agent \(eg. person, group, software or physical artifact\). | NAV | _team name_ |
| publisher | optional | The entity responsible for making the topic available. An agent \(eg. person, group, software or physical artifact\). | NAV | NAV |
| accessRights | optional | Information about who can access the topic or an indication of its security status. | internal | internal |
| license | optional | Either a license URI or a title. | MIT |  |
| rights | optional | A statement that concerns all rights not addressed with `license` or `accessRights`, such as copyright statements. | Copyright 2020, NAV | Copyright _year_, NAV |
| catalog | optional | The catalog\(s\) where the metadata will be published. The value can be either `internal` \(only visibible within the organization\) or `public`. | public | internal |

### Permanently deleting topic and data

!!! warning
    Permanent deletes are irreversible. Enable this feature only as a step to completely remove your data.


When a `Topic` resource is deleted from a Kubernetes cluster, the Kafka topic is still retained, and the data kept intact. If you need to remove data and start from scratch, you must add the following annotation to your `Topic` resource:

=== "topic.yaml"
    ```yaml
    ---
    apiVersion: kafka.nais.io/v1
    kind: Topic
    metadata:
      annotations:
        kafka.nais.io/removeDataWhenResourceIsDeleted: "true"
    ```

When this annotation is in place, deleting the topic resource from Kubernetes will trigger data removal.

## Accessing topics from an application

Adding `.kafka.pool` to your `Application` spec will inject Kafka credentials into your pod. Your application needs to follow some design guidelines; see the next section on [application design guidelines](#application-design-guidelines). Make sure that the topic name matches the `fullyQualifiedName` found in the Topic resource, e.g. `myteam.mytopic`.

=== "nais.yaml"
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
| :--- | :--- |
| `KAFKA_BROKERS` | Comma-separated list of HOST:PORT pairs to Kafka brokers |
| `KAFKA_SCHEMA_REGISTRY` | URL to schema registry |
| `KAFKA_SCHEMA_REGISTRY_USER` | Username to use with schema registry |
| `KAFKA_SCHEMA_REGISTRY_PASSWORD` | Password to use with schema registry |
| `KAFKA_CERTIFICATE` | Client certificate for connecting to the Kafka brokers, as string data |
| `KAFKA_CERTIFICATE_PATH` | Client certificate for connecting to the Kafka brokers, as file |
| `KAFKA_PRIVATE_KEY` | Client certificate key for connecting to the Kafka brokers, as string data |
| `KAFKA_PRIVATE_KEY_PATH` | Client certificate key for connecting to the Kafka brokers, as file |
| `KAFKA_CA` | Certificate authority used to validate the Kafka brokers, as string data |
| `KAFKA_CA_PATH` | Certificate authority used to validate the Kafka brokers, as file |
| `KAFKA_CREDSTORE_PASSWORD` | Password needed to use the keystore and truststore |
| `KAFKA_KEYSTORE_PATH` | PKCS\#12 keystore for use with Java clients, as file |
| `KAFKA_TRUSTSTORE_PATH` | JKS truststore for use with Java clients, as file |
| `AIVEN_SECRET_UPDATED` | A timestamp of when the secret was created |

### What happens on deploy?

When you deploy an application that requests access to Kafka, Naiserator will create an `AivenApplication` resource in the cluster.
The `AivenApplication` has a name that matches the deployed application, and the name of the secret to generate. 
Naiserator will request that a secret with this name used in the deployment.

When an `AivenApplication` resource is created or updated, Aivenator will create a new service user and generate credentials. 
These credentials are then inserted into the requested secret and used in the deployment.

If there is a problem generating the secret, this might fail your deployment. 
In this case, Aivenator will update the `status` part of the resource, with further information about the problem.

## Accessing topics from an application on legacy infrastructure

If you have an application on legacy infrastructure (outside NAIS clusters), you can still access topics with a few more manual steps.

The first step is to add your application to the topic ACLs, the same way as for applications in NAIS clusters (see [the previous section](#accessing-topics-from-an-application)).
Use your team name, and a suitable name for the application, following NAIS naming conventions.

To create a credentials for your application, you need to manually create the `AivenApplication` resource that would normally be created by Naiserator.

=== "aivenapp.yaml"
    ```yaml
    ---
    apiVersion: aiven.nais.io/v1
    kind: AivenApplication
    metadata:
      name: legacyapplication
      namespace: myteam
    spec:
      kafka:
        pool: nav-dev
      secretName: unique-name
      protected: true
    ```

Since Aivenator automatically deletes secrets that are not in use by any pod, you need to set the `protected` flag to `true`.
This ensures that the secret will not be deleted by any automated process.

After the `AivenApplication` resources has been created, Aivenator will create the secret, using the name specified.
Using `kubectl`, extract the secret and make the values available to your legacy application.

When you no longer have a need for the credentials created in this way, delete the `AivenApplication` resource, and make sure the secret is also deleted.

If you migrate the application to NAIS, the first deploy to NAIS will overwrite the `AivenApplication` resource.
When this happens, it is no longer `protected`.
In this case, it is recommended that you manually delete the protected secret when it is no longer needed.


## Application design guidelines

The NAIS platform will generate new credentials when your applications is deployed. Kafka requires TLS client certificates for authentication. Make sure your Kafka and/or TLS library can do client certificate authentication, and that you can specify a custom CA certificate for server validation.

## Migrating from on-prem to Aiven

There are multiple viable strategies for migrating to Aiven. Which one is best for your team depends on many factors. Here we will describe a few approaches, other approaches are also possible. You need to find the one that suits your situation best. Make sure you understand how the different approaches affects your message processing. Some approaches might result in messages being processed more than once, and some approaches might allow for messages to be processed out of order.

If you are using the Schema Registry, you need to make sure that your schemas are uploaded to the new schema registry in Aiven when migrating. How you do that depends on how you do your migration.

The first step is always:

* Create the topic using the new [Topic resource](kafka.md#creating-topics-and-defining-access), and set proper ACLs

The final step should always be:

* Remove the topic from the on-prem clusters, making sure to delete all data

### The simplest case

This approach is suitable if:

* You don't need to keep historical data
* You control all producers and consumers of the topic
* A short pause in processing of messages is acceptable

The process is quite simple:

1. Change producers to write messages to Aiven
2. Wait for consumers to process the last messages on-prem
3. Change consumers to read messages from Aiven

### Double producer

This approach is suitable if:

* You don't need to keep historical data
* You control the producer
* Your messages are idempotent

Follow these steps:

1. Change producers to write messages both to on-prem and to Aiven
2. Change consumers to read messages from Aiven, allowing for the fact that some messages will be 

   processed twice \(once when read from on-prem, once when read from Aiven\)

3. When all consumers are reading from Aiven, remove old code from producer

### Double consumers

This approach is suitable if:

* You don't need to keep historical data
* The consumers are easier to change than the producer, or there are multiple producers

Follow these steps:

1. Change all consumers to read messages from both on-prem and Aiven
2. Change producer\(s\) to write messages to Aiven
3. Wait for consumers to process last messages on-prem
4. Remove old code from consumers

### Simple mirroring

This approach is suitable if:

* You have historical data you wish to keep
* You can afford a pause in processing of messages

Follow these steps:

1. Create a mirroring application that reads messages from on-prem and writes them to Aiven (The NAIS team has created [AiviA](https://github.com/nais/aivia) for this)
2. Stop producers
3. Wait for mirroring to catch up
4. Change consumers to read messages from Aiven
5. Change producer to write messages to Aiven
6. Delete mirroring application

### Advanced mirroring

This approach is more complicated and requires considerable effort to get set up and working correctly. If possible we want to avoid having to do this.

This approach is suitable if:

* You have historical data you wish to keep
* You can't afford a pause in processing of messages
* Your messages are not idempotent

Follow these steps:

1. Contact us to discuss if you really need this
2. Wait while we set up and configure MirrorMaker to handle the mirroring of your topic, including schemas and consumer offsets
3. Change consumers to read messages from Aiven
4. Change producer to write messages to Aiven
5. Remove MirrorMaker configuration (or let us know that we can remove it)

## Avro and schema

### Delete schema

You can delete schemaes (or versions) using the REST-API for the schema registry.
The easiest way to communicate with the API is to use curl from one of your Kafka-pods, so that you have easy access to both the schema registry URL and the username/password.

In order to delete version 10 of the schema registered under subject "test-key" (if it exists):

```
$ curl -X DELETE -u brukernavn:passord http://$KAFKA_SCHEMA_REGISTRY/subjects/test-key/versions/10
  10
```

To delete all versions of the schema registered under subject "test-key":
```
$ curl -X DELETE -u brukernavn:passord http://$KAFKA_SCHEMA_REGISTRY/subjects/test-key
  [1]
```

## REST API

For applications that can't use Kafka directly, a REST API is possible.
Because of security implications, we have not enabled the REST API on the cluster, but interested parties may run their own instance.

We have packaged [Aivens Karapace](https://github.com/aiven/karapace) project in a NAIS-friendly package.
Teams can install [Karapace](https://github.com/nais/karapace) in their own namespace with relevant access to provide a REST API for Kafka topics.
Check the Karapace Readme for details.


## FAQ/Troubleshooting

### Why do I have to specify a pool name if there is only `nav-dev` and `nav-prod`?

Custom pools might be added in the future, so this is done to avoid changing that part of the API.

### I can't produce/consume on my topic, with an error message like "topic not found". What's wrong?

You need to use the _fully qualified name_; check the `.status.fullyQualifiedName` field in your Topic resource.

### I can't produce/consume on my topic, with an error message like "not authorized". What's wrong?

Make sure you added the application to `.spec.acl` in your `topic.yaml`.

### I get the error _MountVolume.SetUp failed for volume "kafka-credentials" : secret ... not found_

Check the status of the `AivenApplication` resource created by Naiserator to look for errors.
