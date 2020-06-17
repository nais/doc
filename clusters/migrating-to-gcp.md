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

## Plans for cloud migration in NAV
### Cloud Strategy
### Roadmap for NAIS
