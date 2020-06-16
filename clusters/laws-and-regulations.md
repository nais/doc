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

The Public Information Act states that everyone shall have access to case documents to facilitate transparency and as such strenghtens:
- Freedom of expression and information
- Democratic participation
- Security under the law
- Public trust and control

There are three requirements that need to be in place for a document to be considered obligatory for archiving:
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

