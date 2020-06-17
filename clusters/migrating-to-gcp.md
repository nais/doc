# Migrating to GCP

# GCP compared to on-premises
|Feature|on-prem|gcp|Comment|
|-------|-------|---|-------|
|Deploy |<ul><li>[x]</li></ul>      |<ul><li>[x]</li></ul>  |different clustername when deploying|
|Logging|<ul><li>[x]</li></ul>      |<ul><li>[x]</li></ul>  |different clustername in logs.adeo.no|
|Metrics|<ul><li>[x]</li></ul>      |<ul><li>[x]</li></ul>  |same mechanism, different datasource|
|Nais app dashboard|<ul><li>[x]</li></ul>      |<ul><li>[x]</li></ul>  |new and improved in GCP|
|Alerts|<ul><li>[x]</li></ul>      |<ul><li>[x]</li></ul>  |identical|
|Secure logs|<ul><li>[x]</li></ul>      |<ul><li>[x]</li></ul>  |different clustername in logs.adeo.no|
|Kafka|<ul><li>[x]</li></ul>      |<ul><li>[x]</li></ul>  |identical|
|Secrets|vault      |Secret manager  ||
|Team namespaces|<ul><li>[x]</li></ul>      |<ul><li>[x]</li></ul>  ||
|Shared namespaces|<ul><li>[x]</li></ul>      |<ul><li>[ ]</li></ul> ]  |Default namespace not available for teams in GCP|
|Health checks|<ul><li>[x]</li></ul>      |<ul><li>[x]</li></ul>  |identical|
|Ingress|<ul><li>[x]</li></ul>      |<ul><li>[x]</li></ul>  |see [GCP] and [on-premises] for available domains | 
|Storage|Ceph      |Buckets  || 
|Postgres|<ul><li>[x]</li></ul> (IAC)      |<ul><li>[x]</li></ul> (self-service)  || 
|Laptop access|<ul><li>[x]</li></ul>       |<ul><li>[x]</li></ul>   || 
|domain: dev.nav.no|<ul><li>[x]</li></ul> (IAC)       |<ul><li>[x]</li></ul> (Automatic)  |Wildcard DNS points to GCP load balancer| 
|domain: dev.adeo.no|<ul><li>[x]</li></ul> (IAC)       |<ul><li>[x]</li></ul> (Automatic)  |Wildcard DNS points to GCP load balancer| 
|Access to FSS services|<ul><li>[x]</li></ul>       |<ul><li>[x]</li></ul>   |Identical (either API-gw or [tokendings][Tokendings]| 
|OpenAM|<ul><li>[x]</li></ul>       |<ul><li>[ ]</li></ul>   |OpenAM is EOL, use [tokendings][Tokendings]| 
|NAV truststore|<ul><li>[x]</li></ul>       |<ul><li>[x]</li></ul>   || 
|PVK required|<ul><li>[x]</li></ul>       |<ul><li>[x]</li></ul>   |amend to cover storage in cloud| 
|Security|Zone Model       |[zero-trust][Zero-trust] || 


## Why migrate?
* Access to self-service [buckets]
  and [Postgres databases][postgres]. 
* Dedicated team namespace with full access, and privilege separation from the rest of NAV.
* Access to Google Cloud features.
* [Zero Trust security model][Zero-trust] instead of FSS/SBS zone model.
* [Built-in call tracing](https://istio.io/docs/tasks/observability/distributed-tracing/) similar to AppDynamics.
* Cost efficient and future proof.

## Prerequisites

### Basic setup
Follow the [getting started instructions][gettingstarted], pay close attention to the section on GCP.

### Security
Our GCP clusters use a zero trust security model, implying that the application
must specify both incoming and outgoing connections in order to receive or send
traffic at all. This is expressed using the [access policy
spec][accesspolicy].

The access policy also enables zone traversal and cross-cluster communication. This
must be implemented in both applications, by using and accepting tokens from
[tokendings]).

{% hint style="warning" %}
Tokendings is finding its way into production, but not yet ready for prime time.
The documentation will be updated when Tokendings is publicly available.
{% endhint %}

### Deploy
Same mechanism as for on-premise clusters. See [GCP clusters][gcp]).

### Ingress
See [GCP clusters][gcp].md).

### ROS and PVK

The team needs to update their ROS and PVK analysis to migrate to GCP.
Refer to the ROS and PVK section under [Google Cloud Platform clusters][gcp]).

The following subsystems are compliant and do not need to be analysed by teams, below is the ROS analysis for thoes:

* [GCP Lagring av data (Buckets og Postgres)](https://apps.powerapps.com/play/f8517640-ea01-46e2-9c09-be6b05013566?ID=219)
* [GCP Tilgangskontrolloppsett](https://apps.powerapps.com/play/f8517640-ea01-46e2-9c09-be6b05013566?ID=218)
* [Tilgang til Kafka fra GCP](https://apps.powerapps.com/play/f8517640-ea01-46e2-9c09-be6b05013566?ID=229)
* [Google Compute Platform - GCP, og Google Kubenetes Engine - GKE](https://apps.powerapps.com/play/f8517640-ea01-46e2-9c09-be6b05013566?ID=95)
* [Bruk av GCP](https://apps.powerapps.com/play/f8517640-ea01-46e2-9c09-be6b05013566?ID=222)


## FAQ
### What do we have to change?
* Cluster name: All references to cluster name. (Logs, grafana, deploy, etc.)
* Secrets: are now stored as native secrets in the cluster, rather than externally in vault.
* Namespace: If your application is in the `default` namespace, you will have to move to team namespace
* Storage: Use `GCS-buckets` instead of `s3` in GCP. Buckets, and access to them, are expressed in your [application manifest][manifest]
* Ingress: There are some domains that are available both on-prem and in GCP, but some differ, make sure to verify before you move.
* Postgres: A new database (and access to it) is automatically configured when expressing `sqlInstance` in your [application manifest][manifest] 
We're currently investigating the possibility of using on-prem databases during a migration window.
* PVK: Update your existing PVK to include cloud
See the table at the top of this page for differences between GCP and on-premises and what applies to your application

### What should we change?
Although not specifically applicable for migration to GCP, you will have an easier time using [tokendings] instead of fighting your way through API-GW
Tokendings is still a concept in early stages, but please do contact us if you're interested, as we're looking for beta testers.

### What do we not need to change?
We've tried our best to make things as familiar as possible, so most things will work as it does today.
You do not have to make any changes to your application code, except when using [buckets] or [postgres], where you need to change how you wire up the data source connections.
Ingresses work the same way, although some domains overlap and others are exclusive.
Logging, secure logging, metrics and alerts work the same way

### What can we do now to ease migration to GCP later?
Make sure your PVK is up to date.

### What about PVK?
A PVK is not a unique requirement for GCP, so all applications should already have one.
The only thing you need to do is update your existing PVK to reflect the fact that it is running in cloud.
See [about security and privacy when using platform services](https://doc.nais.io/#about-security-and-privacy-when-using-platform-services) for details

### How do we migrate our database?
Standard export from the old database and import in to the new one.
That being said, we're looking in to the possibility of using the on-prem database during a migration process. 

### Why is there no vault in GCP?
There is native functionality in GCP that overlap with many of the use cases that Vault have covered on-prem.
Using these mechanisms removes the need to deal with these secrets at all.
Introducing team namespaces allows the teams to manage their own secrets in their own namespaces without the need for IAC and manual routines.
For other secrets that are not used by the application during runtime, you can use the secrets manager in each team's GCP project.

### How do we migrate from vault to secrets manager
Retrieve the secret from vault and store it in a file. `kubectl apply -f <secret-file>`. See the [secrets documentation][secrets] for an example.

### How do we migrate from filestorage to buckets

### What are the plans for cloud migration in NAV?
### What can we do in our GCP project?
--  [](Cloud Strategy)
-- Roadmap for NAIS
### How long does it take to migrate?
A minimal application without any external requirements only have to change a single configuration parameter when deploying and have migrated their application in 5 minutes.
See the table at the top of this page for differences between GCP and on-premises and what applies to your application

## Legal
* Are we allowed to use GCP?
-- DPA signed
## Laws and regulation 

[GCP]: ./gcp.md
[on-premises]: ./on-premises.md
[tokendings]: https://github.com/nais/tokendings
[zero-trust]: https://github.com/navikt/pig/blob/master/kubeops/doc/zero-trust.md
[buckets]: ../persistence/buckets.md
[postgres]: ../persistence/postgres.md
[gettingstarted]: ../basics/access.md
[accesspolicy]: ../nais-application/access-policy.md
[manifest]: ../nais-application/max-example.md
[secrets]: ../addons/secrets.md