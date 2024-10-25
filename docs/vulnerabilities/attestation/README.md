---
tags: [attestation, docker-build-push, explanation]
---

# Attestation with Docker Build Push

Nais provides a GitHub Action for building and pushing Docker images to the [Google Container Registry](https://cloud.google.com/artifact-registry/docs).  

The action automatically generates a signed attestation with the help of [Trivy](https://github.com/aquasecurity/trivy-action) and [cosign](https://github.com/sigstore/cosign).  
The attestation envelope includes a [SBOM](../explanations/README.md#software-bill-of-materials) (Software Bill of Materials) for your container image and its dependencies.

The SBOM is uploaded to the same registry alongside your image.

:dart: [**Learn how to sign attestations**](how-to/attestation.md)