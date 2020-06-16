# Migrating to GCP

## Why migrate?
* Access to self-service [storage buckets](../persistence/buckets.md)
  and [Postgres databases](../persistence/postgres.md). 
* Dedicated team namespace with full access, and privilege separation from the rest of NAV.
* Access to Google Cloud features.
* [Zero Trust security model](https://github.com/navikt/pig/blob/master/kubeops/doc/zero-trust.md) instead of FSS/SBS zone model.
* [Built-in call tracing](https://istio.io/docs/tasks/observability/distributed-tracing/) similar to AppDynamics.
* Cost efficient and future proof.

## Prerequisites

### Basic setup
Follow the [getting started instructions](../basics/access.md), pay close attention to the section on GCP.

### Security
Our GCP clusters use a zero trust security model, implying that the application
must specify both incoming and outgoing connections in order to receive or send
traffic at all. This is expressed using the [access policy
spec](../nais-application/access-policy.md).

The access policy also enables zone traversal and cross-cluster communication. This
must be implemented in both applications, by using and accepting tokens from
[tokendings](https://github.com/nais/jwker/blob/master/TOKENFLOW.md).

{% hint style="warning" %}
Tokendings is finding its way into production, but not yet ready for prime time.
The documentation will be updated when Tokendings is publicly available.
{% endhint %}

#### Secrets
* Migrate from Vault /to be filled in

### Deploy
Same mechanism as for on-premise clusters. See [GCP clusters](gcp.md).

### Ingress
See [GCP clusters](gcp.md).

### Storage
* File Storage. /to be filled in
* PostgreSQL, /to be filled in
** How to migrate from a on-prem database to cloud database

### Access to on-prem services
* Services in on-prem SBS cluster, /to be filled in
* Services in on-prem FSS cluster, /to be filled in
* Kafka, /to be filled in 

### Metrics and Logs
* Prometheues
* Logs
** Secure logs

## Laws and regulation

### DPA with Google Cloue Platform
/to be filled in

### ROS and PVK

The team needs to update their ROS and PVK analysis to migrate to GCP.
Refer to the ROS and PVK section under [Google Cloud Platform clusters](gcp.md).

The following subsystems are compliant and do not need to be analysed by teams, below is the ROS analysis for thoes:

* [GCP Lagring av data (Buckets og Postgres)](https://apps.powerapps.com/play/f8517640-ea01-46e2-9c09-be6b05013566?ID=219)
* [GCP Tilgangskontrolloppsett](https://apps.powerapps.com/play/f8517640-ea01-46e2-9c09-be6b05013566?ID=218)
* [Tilgang til Kafka fra GCP](https://apps.powerapps.com/play/f8517640-ea01-46e2-9c09-be6b05013566?ID=229)
* [Google Compute Platform - GCP, og Google Kubenetes Engine - GKE](https://apps.powerapps.com/play/f8517640-ea01-46e2-9c09-be6b05013566?ID=95)
* [Bruk av GCP](https://apps.powerapps.com/play/f8517640-ea01-46e2-9c09-be6b05013566?ID=222)

### Archiving

#### Background

When moving to GCP or other public cloud providers not based in Norway, an evaluation of the documentation requirements for the application must be done. There are several important regulations that apply to this documentation, as stated by The Archival Act For Public Archives of 2018 (referred to as The Archival Act from now on).

The requirements are set to ensure documents that contain judicial or important administrative information are stored and made available for future inspection (§1)
NAV is, as a public body and central government agency, obligated to keep archival records to make sure the documents are stored safely as information sources for present and future (§2).

The Public Information Act states that everyone shall have access to case documents and journals to facilitate transparency and as such strenghtens:
- Freedom of expression and information
- Democratic participation
- Security under the law
- Public trust and control

There are three requirements that need to be in place for a document to be considered obligatory for journaling/archiving:
- There must exist a case document for the public body
- The document must have been sent from or received by the public body
- The document must be case handled and have value as documentation

Public bodies and agencys are obligated to archive all documents that are created during its handling of business: 
- The documents have value as documentation or are being case handled
- The documents must be archived whether they have been used externally or are created for internal use
- The documents that are created electronically must be made available for The National Archives

The Archival Act states:
A document is defined, by The Archival Act, as a logically limited source of information stored no a media for subsequent reading, listening, viewing or transfer.
An archive is defined as documents that are created during business handling.
Obligatory archiving is defined as storage for documenting the handling.

#### General regulations when migrating to public cloud providers

Without a motion or expressed consent from the National Archivist the records cannot:
- Be moved out of country
- Be deleted
- Be redacted or edited (if it applies to the obligatory documentation)

Documents that requires archival storage must be stored on a media and in a format that fulfills the necessary requirements for durability and accessability (§6). I.e. these documents must be stored 
in a way that ensures authenticity, reliability, integrity and usability.

Rules must be made for deletion of all documentation (§16).

Public bodies are to deliver older and finished archives to an archival depot (§18).

Sourced in large part from  documentation for SalesForce migration to cloud:
https://confluence.adeo.no/display/PTC/Arkivering+og+dokumentasjon+i+Salesforce

All paragraphs of law are from The Archival Act:
[The Archival Act For Public Archives](https://lovdata.no/dokument/SF/forskrift/2017-12-15-2105?q=arkiv)

## Plans for cloud migration in NAV
### Cloud Strategy
### Roadmap for NAIS
