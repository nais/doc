# Introduction to NAIS

!!! info "Google Cloud Platform is now in General Availability"
    We recommend that everyone deploy new applications to [GCP](clusters/gcp.md).
    We have made a [migration guide](clusters/migrating-to-gcp.md) to help with moving applications from [on-premises clusters](clusters/on-premises.md) to GCP!

    Head over to the Slack channel [\#nais-i-sky](https://nav-it.slack.com/archives/C0190SV7KSN) if you have any further questions.


## What is NAIS?

NAIS is _NAV's Application Infrastructure Service_, an open source application platform that aims to provide our developers with the best possible tools needed to develop and run their applications.

## Getting started with NAIS

If you are unfamiliar with NAIS and how to deploy your applications there, the [Getting started](basics/access/) section will get you up to speed!

## Why NAIS exists

When you have a large development organisation, providing the developers with turn-key solutions for their most common needs can be a good investment.

This includes \(but not limited to\) [logging](observability/logs/), [metrics](observability/metrics.md), [alerts](observability/alerts/), [deployment](deployment/) and a runtime environment (across [on-prem](clusters/on-premises.md) and [GCP](clusters/gcp.md)).

Within each of these aspects, we leverage open source projects best suited for our needs and provide them with usable abstractions, sane defaults and the required security hardening.

### GitOps

GitOps is a way of implementing Continuous Deployment for cloud native applications. It focuses on a developer-centric experience when operating infrastructure, by using tools developers are already familiar with, including Git and Continuous Deployment tools.

Read more over at [gitops.tech](https://www.gitops.tech).
> GitOps: versioned CI/CD on top of declarative infrastructure. Stop scripting and start shipping.
>
> — [Kelsey Hightower](https://twitter.com/kelseyhightower/status/953638870888849408)

## About security and privacy when using platform services

In general, the necessary agreements and assessments regarding security and privacy for use of the NAIS platform in GCP are in place.
A summary can be found in: [NAIS on GCP - privacy and security](https://navno.sharepoint.com/:w:/r/sites/Skystrategi817/Shared%20Documents/General/Personvern%20og%20sikkerhet/GCP/NAIS%20(GCP)%20-%20personvern%20og%20sikkerhet.docx?d=wd94444c57c0348b9b7ab34863488c684&csf=1&web=1&e=j3dUzd). 
This document is only available for NAV employees and in Norwegian.

A security assessment ([*ROS*](./legal/app-ros.md)) has been carried out covering the services that NAIS offers.
Teams that wish to use NAIS are responsible for assessing whether the security is sufficient for their use.
Most safety assessments are documented in the PowerApps application [TryggNok](https://navno.sharepoint.com/sites/intranett-it/SitePages/Skal-du-bruke-TryggNok-for-f%C3%B8rste-gang-.aspx) (internal link).
[Contact the NAIS team](#contact-the-nais-team) if you can't find a relevant security assessment.

In NAV, we conduct Privacy Impact Assessments ([*PVK*](./legal/app-pvk.md)) to document that we operate in accordance with GDPR. 
Each team must have a PVK that covers any processing of personal data that may occur in their applications.

Adopting a new technology may also impact privacy, in which case the team should update their PVK.
ROS will often include information security, and can provide support in the completion of the PVK.

If the team wants to process personal data in a new way, the existing PVK might not cover that purpose.
This requires a new PVK in order to document the purpose and legal grounds for the treatment.
A legal coach from "juridisk seksjon" can assist with such an assessment.

## On-call services
NAIS has a 24/7 on-call service for operation and troubleshooting of the on-premises and GCP platforms, as well as third-party suppliers Aiven. 

During regular working hours, you can mention @nais-team on Slack.

The on-call service is to be used for production environment events outside regular working hours only.

The on-call service is rotated, the person on-call can be found in the Slack user group "nais-vakt".
The on-call phone number can be found in the header of the [NAIS Slack](https://nav-it.slack.com/archives/C5KUST8N6).

Response time for a request should be no more than 30 minutes for Slack mentions (@nais-vakt).

## Contact the NAIS team

The team can be found on [Slack](https://nav-it.slack.com/messages/C5KUST8N6/).

### Would your team like to work more closely with NAIS?
If your team would like closer follow-up for a period (or permanently), we would happily dedicate someone from NAIS as your NAM(s) - short for "NAIS Account Managers".
This means we will create a dedicated Slack channel for NAIS/team-communication and have meetings if required to discuss your concerns, issues, or wishes for the platform.

---
Also, follow us on Twitter [@nais\_io](https://twitter.com/nais_io)!
