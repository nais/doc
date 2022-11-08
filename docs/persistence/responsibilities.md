---
description: >-
  This page aims to clarify the responsibilities as relates to data storage
  using NAIS and GCP. Depending on which infrastructure the data is stored on,
  the responsibilites look slightly different.
---

# Responsibilities

It is important to understand the responsibilities of the different parties involved when working with data in NAIS. This page aims to clarify the responsibilities as relates to data storage on-prem and in GCP. Depending on which infrastructure the data is stored on, the responsibilites look slightly different.

## The Platform

The platform does not manage the underlying infrastructure or run the data storage service provided by the platform. These are provided by NAV, Google or Aiven. NAIS is responsible for setting up the infrastructure and data storage service according to the specifications provided by the application `sepc`.

The platform team is responsible for the following:

* Provisioning and maintaining underlying infrastructure
* Tooling and automation to make it easy to use the platform
* Providing documentation and support for the platform

The platform team is **not** responsible for the application itself, not the data stored in the provided data storage services.

??? note "List of data processors"

    | Infrastructure | Data processor |
    |----------------|----------------|
    | On-premis      | NAV (ITIP)     |
    | Cloud Storage  | Google         |
    | Cloud SQL      | Google         |
    | BigQuery       | Google         |
    | Kafka          | Aiven          |
    | Elasticsearch  | Aiven          |
    | OpenSearch     | Aiven          |

## The Team

At the end of the day, the team is responsible for its own data and how it is managed. This includes compliance with data policies (e.g. GDPR or archiving), ensuring disaster recovery (aided by tooling and interfaces supplied by the platform) and daily operations.

### Team Checklist for Data Storage

Here is a simple checklist for what the teams should think about related to how and where the data is stored:

* [x] Update \[Behadlingskatalogen\]&lt;&gt; where data is stored.
* [x] Is the data storage in compliance with data policies (GDPR, PII, etc.)?
* [x] What is the SLA for the data storage?
* [x] What is the backup strategy for the data storage?
