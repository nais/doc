# Introduction to NAIS

!!! info "GCP is now in General Availability, and we recommend everyone to deploy new apps there."
    We've also made a [migration guide](clusters/migrating-to-gcp.md), for moving old apps from SBS and FSS to GCP!

    Head over to the Slack channel [\#nais-i-sky](https://nav-it.slack.com/archives/C0190SV7KSN) if you have any questions.


## What is NAIS?

NAIS is _NAV's Application Infrastructure Service_, an open source application platform that aims to provide our developers with the best possible tools needed to develop and run their applications.

## Getting started with NAIS

If you are just starting out developing applications and wish to deploy them to NAIS, it is highly recommended to read through the [Getting started](basics/) section!

## Why NAIS exists

When you have a large development organisation, providing the developers with turn-key solutions for their most common needs can be a good investment.

This includes \(but not limited to\) [logging](observability/logs/), [metrics](observability/metrics.md), [alerts](observability/alerts/), [deployment](deployment/) and a [runtime environment](clusters/).

Within each of these aspects, we leverage open source projects best suited for our needs and provide them with usable abstractions, sane defaults and the required security hardening.

### GitOps

GitOps is a way of implementing Continuous Deployment for cloud native applications. It focuses on a developer-centric experience when operating infrastructure, by using tools developers are already familiar with, including Git and Continuous Deployment tools.

Read more over at [gitops.tech](https://www.gitops.tech).

> GitOps: versioned CI/CD on top of declarative infrastructure. Stop scripting and start shipping.
>
> — [Kelsey Hightower](https://twitter.com/kelseyhightower/status/953638870888849408)

## About security and privacy when using platform services

For services from NAIS, a security assessment ([*ROS*](./legal/app-ros.md)) has already been carried out. 
Teams who wish to use the service are responsible for assessing whether the security is sufficient for their use. 
Most safety assessments are documented in the PowerApps application TryggNok. 
[Contact the NAIS team](#contact-the-nais-team) if you can´t find a relevant security assessment.

In NAV, we conduct Privacy Impact Assessments ([*PVK*](./legal/app-pvk.md)) to document that we operate in accordance with GDPR. 
Each team must have a PVK for the processing of personal data that they do. 
When a team adopts new technology, it may trigger a change in the privacy impact. 
If so, the team should update the PVK. ROS will often include information security, and can provide support in the completion of the PVK.

When a team wants to process personal data in a whole new way, the existing PVK might not cover this purpose. In this case, a new PVK is required in order to document the purpose and legal basis for the treatment. A legal coach from "juridisk seksjon" can assist with such an assessment.

## Contact the NAIS team

The team can be found on [Slack](https://nav-it.slack.com/messages/C5KUST8N6/).

Also, follow us on Twitter [@nais\_io](https://twitter.com/nais_io)!

