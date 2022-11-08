---
description: >-
  This page aims to clarify the responsibilities as relates to data storage
  using NAIS and GCP. Depending on which infrastructure the data is stored on,
  the responsibilites look slightly different.
---

# Responsibilities

It is important to understand the responsibilities of the different parties
involved when storing data in NAIS and GCP. This page aims to clarify the
responsibilities as relates to data storage using NAIS and GCP. Depending on
which infrastructure the data is stored on, the responsibilites look slightly
different.

## Platform

The platform team is responsible for the following:

* Provisioning and maintaining the infrastructure
* Automating the provisioning of infrastructure
* Providing documentation and support for the infrastructure

### Who operates what?

| Infrastructure | Data processor |
|----------------|----------------|
| On-premis      | ITIP (NAV)     |
| Cloud Storage  | Google         |
| Cloud SQL      | Google         |
| BigQuery       | Google         |
| Kafka          | Aiven          |
| Elasticsearch  | Aiven          |
| OpenSearch     | Aiven          |

## Teams

The team is responsible for how they use the storage infrastructure and the data
they store.

### Checklist

Here is a simple checklist for what the teams should think about:

* [x] Update \[Behadlingskatalogen\]&lt;&gt; where data is stored.
* [x] Is the data storage in compliance with data policies (GDPR, PII, etc.)?
* [x] What is the SLA for the data storage?
* [x] What is the backup strategy for the data storage?

## Operating storage infrastructure

* For data stored in NAV's on-premises data centers, ITIP is operating the storage infrastructure
* For data stored in GCP, Google is operating the storage infrastructure. If your team uses data storage in GCP, \[Behandlingskatalogen\]&lt;&gt; should be updated to reflect that Google is a data processor
* For data stored in Azure, Microsoft is operating the storage infrastructure. If your team uses data storage in Azure, \[Behandlingskatalogen\]&lt;&gt; should be updated to reflect that Microsoft is a data processor

## Operating and maintaing tooling for provisioning and interfacing with storage

* For on-premises storage, either ITIP or the NAIS team is responsible for storage tooling and interfaces depending on the tool/interface
* For cloud storage, the NAIS team maintains some tooling \(like provisioning for GCP buckets\), while other tools/interfaces are operated by the cloud vendor

## Data contents, operations and compliance with data policies

At the end of the day, the team is responsible for its own data. This includes compliance with data policies \(e.g. GDPR or archiving\), ensuring disaster recovery \(aided by tooling and interfaces supplied by the platform\) and daily operations.

