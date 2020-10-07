# Data responsibilities in NAIS

This document aims to clarify the responsibilities as relates to data storage using NAIS and GCP. Depending on which infrastructure the data is stored on, the responsibilites look slightly different.

## Responsibilities
### Operating storage infrastructure
* For data stored in NAV's on-premises data centers, ITIP is operating the storage infrastructure
* For data stored in GCP, Google is operating the storage infrastructure. If your team uses data storage in GCP, [Behandlingskatalogen]<> should be updated to reflect that Google is a data processor
* For data stored in Azure, Microsfot is operating the storage infrastructure. If your team uses data storage in Azure, [Behandlingskatalogen]<> should be updated to reflect that Microsoft is a data processor

### Operating and maintaing tooling for provisioning and interfacing with storage
* For on-premises storage, either ITIP or the NAIS team is responsible for storage tooling and interfaces depending on the tool/interface
* For cloud storage, the NAIS team maintains some tooling (like provisioning for GCP buckets), while other tools/interfaces are operated by the cloud vendor

### Data contents, operations and compliance with data policies
At the end of the day, the team is responsible for its own data. This includes compliance with data policies (e.g. GDPR or archiving), ensuring disaster recovery (aided by tooling and iterfaces supplied by the platform) and daily operations.
