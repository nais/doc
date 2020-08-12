## Why migrate?
* Access to self-service [buckets] and [Postgres databases][postgres]. 
* Access to Google Cloud features.
* [Zero Trust security model][zero-trust] instead of FSS/SBS zone model.
* [Built-in call tracing](https://istio.io/docs/tasks/observability/distributed-tracing/) similar to AppDynamics.
* Cost efficient and future proof.

## Prerequisites
The team needs to update their ROS and PVK analysis to migrate to GCP.
Refer to the ROS and PVK section under [Google Cloud Platform clusters][GCP].

### Basic setup
Follow the [getting started instructions][gettingstarted], pay close attention to the section on GCP.

### Security
Our GCP clusters use a zero trust security model, implying that the application
must specify both incoming and outgoing connections in order to receive or send
traffic at all. This is expressed using the [access policy
spec][accesspolicy].

The access policy also enables zone traversal and cross-cluster communication. This
must be implemented in both applications, by using and accepting tokens from
[tokendings].

{% hint style="warning" %}
Tokendings is finding its way into production, but not yet ready for prime time.
The documentation will be updated when Tokendings is publicly available.
{% endhint %}

### Deploy
Same mechanism as for on-premise clusters. See [GCP clusters][GCP].

### Ingress
See [GCP clusters][GCP].

### ROS and PVK
The following subsystems are compliant and do not need to be analysed by teams:

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
Use [tokendings] instead of API-GW
If using automatically configured [buckets] or [postgres], use [Google APIs](https://cloud.google.com/storage/docs/reference/libraries)

### What do we not need to change?
You do not have to make any changes to your application code.
Ingresses work the same way, although some domains overlap and others are exclusive.
Logging, secure logging, metrics and alerts work the same way

### What can we do now to ease migration to GCP later?
Make sure your PVK is up to date.
Deploy your application to your team's namespace instead of `default`

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
For other secrets that are not used by the application during runtime, you can use the [Secret Manager](https://cloud.google.com/secret-manager) in each team's GCP project.

### How do we migrate from vault to secrets manager
Retrieve the secret from vault and store it in a file. `kubectl apply -f <secret-file>`. See the [secrets documentation][secrets] for an example.

### How do we migrate from filestorage to buckets
Add a bucket to your application spec
Copy the data from the filestore using [s3cmd](https://s3tools.org/s3cmd) to the bucket using [gsutil](https://cloud.google.com/storage/docs/gsutil)

### What are the plans for cloud migration in NAV?
We aim to shut down both sbs clusters by summer 2021
NAVs strategic goal is to shut off all on-prem datacenters by the end of 2023

### What can we do in our GCP project?
The teams GCP projects are primarily used for automatically generated resources (buckets and postgres).
We're working on extending the service offering.
However, additional access may be granted if required by the team

### How long does it take to migrate?
A minimal application without any external requirements only have to change a single configuration parameter when deploying and have migrated their application in 5 minutes.
See the table at the top of this page for differences between GCP and on-premises and what applies to your application

## Legal
* Are we allowed to use GCP?
yes
See [laws and regulations](./laws-and-regulations.md) for details

# GCP compared to on-premises
|Feature|on-prem|gcp|Comment|
|-------|-------|---|-------|
|Deploy |✔️      |✔️  |different clustername when deploying|
|Logging|✔️      |✔️  |different clustername in logs.adeo.no|
|Metrics|✔️      |✔️  |same mechanism, different datasource|
|Nais app dashboard|✔️      |✔️  |new and improved in GCP|
|Alerts|✔️      |✔️  |identical|
|Secure logs|✔️      |✔️  |different clustername in logs.adeo.no|
|Kafka|✔️      |✔️  |identical|
|Secrets|vault      |Secret manager  ||
|Team namespaces|✔️      |✔️  ||
|Shared namespaces|✔️      |✖️  |Default namespace not available for teams in GCP|
|Health checks|✔️      |✔️  |identical|
|Ingress|✔️      |✔️  |see [GCP] and [on-premises] for available domains | 
|Storage|Ceph      |Buckets  || 
|Postgres|✔️ (IAC)      |✔️ (self-service)  || 
|Laptop access|✔️       |✔️   || 
|domain: dev.nav.no|✔️ (IAC)       |✔️ (Automatic)  |Wildcard DNS points to GCP load balancer| 
|domain: dev.adeo.no|✔️ (IAC)       |✔️ (Automatic)  |Wildcard DNS points to GCP load balancer| 
|Access to FSS services|✔️       |✔️   |Identical (either API-gw or [tokendings][Tokendings]| 
|OpenAM|✔️       |✖️   |OpenAM is EOL, use [tokendings][Tokendings]| 
|NAV truststore|✔️       |✔️   || 
|PVK required|✔️       |✔️   |amend to cover storage in cloud| 
|Security|Zone Model       |[zero-trust] || 

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