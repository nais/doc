---
tags: [salsa, slsa, supply-chain, vulnerabilities, explanation]
description: NAIS provides a set of services to help you secure your software supply chain and manage vulnerabilities in your workloads.
---

# Vulnerability insights and management

NAIS provides a set of tools and services to help you secure your software supply chain and manage vulnerabilities in your workloads:

<div class="grid cards" markdown>

- [**Attestation**][Attestation] (nais/docker-build-push)

    GitHub action that helps to secure a supply chain for software artifacts.

- [**Vulnerability Insights**][Insights]

    Tools to manage vulnerabilities in your workloads.

</div>

The NAIS [SLSA](explanations/README.md#slsa) is built on a security framework designed to prevent tampering, enhance integrity, and secure both packages and infrastructure within software projects.
Se the different tools below and follow the links to the respective tool for more details.

## Getting started with vulnerability insights

The setup of vulnerability insights for an workload is straightforward and only requires you to add the [nais/docker-build-push][Attestation] action to your GitHub workflow.
Once added, the action will automatically generate a signed attestation, including a [SBOM][SBOM]
(Software Bill of Materials) for your container image and its dependencies.
This is bundled as an [attestation](explanations/README.md#attestation) and pushed to your container registry along with your image and plays a key role in providing proof that the software supply chain follows secure processes.

## Acknowledge vulnerabilities

NAIS continuously monitors deployed container images in the cluster. 
When a new image is detected, NAIS automatically uploads its [SBOM][SBOM] to [DependencyTrack][Insights] for vulnerability analysis.

The results of the DependencyTrack analysis, including vulnerability insights, can then be viewed in the NAIS Console.
The [NAIS Console][Insights] provides a platform for viewing and managing vulnerabilities at the team level.

[Attestation]: attestation/README.md
[Insights]: insights/README.md
[SBOM]: explanations/README.md#software-bill-of-materials
