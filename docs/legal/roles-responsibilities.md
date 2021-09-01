# Responsibilities - nais and teams

"Nais" is a term that denotes a set of services offered by the nais team which the product teams can use when building their products. 
The nais services are built on infrastructure and underlying services offered by different infrastructure teams and cloud platform vendors. 
In general, responsibilities for services are separated along these lines:

* Cloud platform vendors (and internal infrastructure teams) are responsible for keeping the infrastructure and underlying platforms running.
* The nais team is responsible for ensuring the nais services are up and running and available for use by the product teams.
* The product teams are responsible for their own applications (including business logic, code, data, etc) and for how they use the nais services.

As a **general rule** the lines of ownership goes along the project lines. The services running in team-projects are the responsibility of the team. Thus the nais-team owns the usage of cloud services running in the nais-project. This includes kubernetes, load-balancing and DNS. 

What constitutes a nais service, an underlying service or what is owned by a product team varies from case to case. 
In some instances, the product team is a user of common resources owned by the nais team (e.g. the ELK stack, or the kubernetes clusters). 
In these cases the nais team operates the resources and is responsible for the service availability. 
In other cases the product teams provision their own resources directly from the underlying vendors. 
In these cases, the product teams have greater direct control over the service. The division of responsibility in the different cases is best described through examples:

## About security and privacy when using platform services

In general, the necessary agreements and assessments regarding security and privacy for use of the NAIS platform in GCP are in place.
A summary can be found in: [NAIS on GCP - privacy and security](https://navno.sharepoint.com/:w:/r/sites/Skystrategi817/Shared%20Documents/General/Personvern%20og%20sikkerhet/GCP/NAIS%20(GCP)%20-%20personvern%20og%20sikkerhet.docx?d=wd94444c57c0348b9b7ab34863488c684&csf=1&web=1&e=j3dUzd). 
This document is only available for NAV employees and in Norwegian.

A security assessment ([*ROS*](/legal/app-ros)) has been carried out covering the services that NAIS offers.
Teams that wish to use NAIS are responsible for assessing whether the security is sufficient for their use.
Most safety assessments are documented in the PowerApps application [TryggNok](https://navno.sharepoint.com/sites/intranett-it/SitePages/Skal-du-bruke-TryggNok-for-f%C3%B8rste-gang-.aspx) (internal link).
[Contact the NAIS team](#contact-the-nais-team) if you can't find a relevant security assessment.

In NAV, we conduct Privacy Impact Assessments ([*PVK*](/legal/app-pvk)) to document that we operate in accordance with GDPR. 
Each team must have a PVK that covers any processing of personal data that may occur in their applications.

Adopting a new technology may also impact privacy, in which case the team should update their PVK.
ROS will often include information security, and can provide support in the completion of the PVK.

If the team wants to process personal data in a new way, the existing PVK might not cover that purpose.
This requires a new PVK in order to document the purpose and legal grounds for the treatment.
A legal coach from "juridisk seksjon" can assist with such an assessment.

## Postgres on GCP

- Developers are responsible for their own credentials
- The product team is responsible for their applications' service accounts and the service account credentials
- The product team is responsible for the data in the database
- The product team is responsible for how the database is configured (e.g how backup is configured)
- The product team is responsible for monitoring the postgres instance, and acting upon the alerts. 
- The product team is responsible for knowing how to restore a backup
- The product team is responsible for informing the nais team if they need any changes in tooling for provisioning and operating the database
- The nais team is responsible for aggregating and prioritizing requirements for changes in provisioning and operating tooling
- The nais team is responsible for which configuration options are offered to the product teams, including setting "sane defaults"
- The nais team is responsible for developer access control
- The nais team is responsible for the tools they make for configuring and operating the databases
- The platform vendor (GCP) is responsible for access control between applications and databases
- The platform vendor is responsible for operating the underlying Postgres service and its infrastructure
- The platform vendor is responsible for operating any additional required services offered by the platform (e.g. backup services)



## Metrics and alerts

- The product team is responsible for making metrics from their applications available
- The product team is responsible for configuring alerts
- The nais team is responsible for collecting metrics in prometheus and influx
- The nais team is responsible for operating prometheus and influx
- The nais team is responsible for ensuring that correctly configured alerts are sent
- The infrastructure team (NAV internal) is responsible for operating the underlying infrastructure
