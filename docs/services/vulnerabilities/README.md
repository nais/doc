---
tags: [salsa, slsa, supply-chain, vulnerabilities, explanation]
description: Nais provides a set of services to help you secure your software supply chain and manage vulnerabilities in your workloads.
---

# Vulnerability insights and management

Nais provides a set of tools and services to help you secure your software supply chain and manage vulnerabilities in your workloads:

<div class="grid cards" markdown>

- [**Attestation**][Attestation] (nais/docker-build-push)

    GitHub action that helps to secure a supply chain for software artifacts.

- [**Vulnerability Insights**][Insights]

    Tools to manage vulnerabilities in your workloads.

</div>

## Getting started with vulnerability insights

The setup of vulnerability insights for an workload is straightforward and only requires you to add the [nais/docker-build-push][Attestation] action to your GitHub workflow.
Once added, the action will automatically generate a signed attestation, including a SBOM
(Software Bill of Materials) for your container image and its dependencies.
This is bundled as an attestation and pushed to your container registry along with your image and plays a key role in providing proof that the software supply chain follows secure processes.

## Acknowledge vulnerabilities

Nais continuously monitors deployed container images in the cluster. 
When a new image is detected, Nais automatically uploads its SBOM to [Dependency-track][Insights] for vulnerability analysis.

The results of the Dependency-track analysis, including vulnerability insights, can then be viewed in the Nais Console.
The [Nais Console][Insights] provides a platform for viewing and managing vulnerabilities at the team level.

[Attestation]: how-to/attestation.md
[Insights]: how-to/insight.md
