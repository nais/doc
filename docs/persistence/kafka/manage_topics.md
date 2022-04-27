# Managing topics and access

!!! warning
    This feature applies only to _Aiven hosted Kafka_. On-premises Kafka is deprecated, and creating new topics on-premises was disabled summer 2021. For on-premises Kafka, see [on-premises Kafka documentation](https://confluence.adeo.no/display/AURA/Kafka).

## Creating topics and defining access

Creating or modifying a `Topic` Kubernetes resource will trigger topic creation and ACL management with Aiven \(hosted Kafka provider\). The topic name will be prefixed with your team namespace, thus in the example below, the fully qualified topic name will be `myteam.mytopic`. This name will be set in the `.status.fullyQualifiedName` field on your Topic resource once the Topic is synchronized to Aiven.

To add access to this topic for your application, see the next section: _Accessing topics from an application_.

Topic resources can only be specified in GCP clusters. However, applications might access topics from any cluster, including on-premises. For details, read the next section.

Currently, use the `nav-dev` pool for development, and `nav-prod` for production.
If you need cross-environment communications, use the `nav-infrastructure` pool, but please consult the NAIS team before you do.

| Pool | Min. replication | Max. replication | Topic declared in | Available from |
| :--- | :--- |:-----------------| :--- | :--- |
| `nav-dev` | 2 | 3                | `dev-gcp` | `dev-gcp`, `dev-fss` |
| `nav-prod` | 2 | 9                | `prod-gcp` | `prod-gcp`, `prod-fss` |
| `nav-infrastructure` | 2 | 3                | `prod-gcp` | `dev-gcp`, `dev-fss`, `prod-gcp`, `prod-fss` |

### ACLs

On your topic, you must define ACLs to manage access to the topic.
Access is granted to applications, belonging to teams.
Every ACL must contain team, application and which access to grant.
Possible access is `read`, `write` and `readwrite`.

It is possible to use simple wildcards (`*`) in both team and application names, which matches any character any number of times.
Be aware that due to the way ACLs are generated and length limits, the ends of long names can be cut, eliminating any wildcards at the end.


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
        minimumInSyncReplicas: 2
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
        - team: trusted-team
          application: *
          access: read     # All applications from this trusted-team has read
        - team: *
          application: aivia
          access: read     # Applicatios named aivia from any team has read
        - team: myteam
          application: rapid-*
          access: readwrite   # Applications from myteam with names starting with `rapid-` has readwrite access
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

When this annotation is in place, deleting the topic resource from Kubernetes will also delete the Kafka topic and all of its data.

## Accessing topics from an application

Adding `.kafka.pool` to your `Application` spec will inject Kafka credentials into your pod. Your application needs to follow some design guidelines; see the next section on [application design guidelines](application.md#application-design-guidelines). Make sure that the topic name matches the `fullyQualifiedName` found in the Topic resource, e.g. `myteam.mytopic`.

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
