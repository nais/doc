# Migrating to GCP

## Why migrate?

* Access to automatically provisioned storage buckets and Postgres databases.
* Dedicated team namespace with full access, and privilege separation from the rest of NAV.
* Access to Google Cloud features.
* Zero Trust security model instead of FSS/SBS zone model.
* Built-in call tracing similar to AppDynamics.
* Cost efficient and future proof.

## ROS and PVK

The team needs to update their ROS and PVK analysis to migrate to GCP.
Refer to the ROS and PVK section under [Google Cloud Platform clusters](gcp.md).

The following subsystems are compliant ([link to
analysis](https://apps.powerapps.com/play/f8517640-ea01-46e2-9c09-be6b05013566)
and do not need to be analysed by teams:

  * GCP Lagring av data (Buckets og Postgres)
  * GCP Tilgangskontrolloppsett
  * Tilgang til Kafka fra GCP
  * Google Compute Platform - GCP, og Google Kubenetes Engine - GKE

## Prerequisites

### Basic setup
Follow the [getting started instructions](../basics/access), pay close attention to the section on GCP.

### Security
Our GCP clusters use a zero trust security model, implying that the application
must specify both incoming and outgoing connections in order to receive or send
traffic at all. This is expressed using the [access policy
spec](../nais-application/access-policy.md).

The access policy also enables zone traversal and cross-cluster communication. This
must be implemented in both applications, by using and accepting tokens from
[tokendings]().

{% hint style="warning" %}
Tokendings is finding its way into production, but not yet ready for prime time.
The documentation will be updated when Tokendings is publicly available.
{% endhint %}

### Deploy
Same mechanism as for on-premise clusters. See [GCP clusters](gcp.md).

### Ingress
See [GCP clusters](gcp.md).
