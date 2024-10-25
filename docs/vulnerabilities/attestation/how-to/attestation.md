---
tags: [attestation, docker-build-push, how-to]
---

# Docker Build Push

Simply add [nais/docker-build-push](https://github.com/nais/docker-build-push) to your workflow.

```yaml
 - uses: nais/docker-build-push@v0
   id: docker-push
   with:
     team: myteam # required
     salsa: true # optional, defaults to true
     project_id: ${{ vars.NAIS_MANAGEMENT_PROJECT_ID }} # required, but is defined as an organization variable
     identity_provider: ${{ secrets.NAIS_WORKLOAD_IDENTITY_PROVIDER }} # required, but is defined as an organization secret
     # ... other options removed for readability
```

??? note Opt-out
    Opt-out from salsa

    If you want to opt-out from salsa you can set the salsa input to false

    ```yaml
    salsa: false
    ```

## Attest sign

The `nais/docker-build-push` action default push to Google Container Registry (GAR).
If you want to push to another registry, you can use the [nais/attest-sign](https://github.com/nais/attest-sign) to generate sbom and sign the attestation.

```yaml
 - uses: nais/attest-sign@v1
   id: attest-sign
   with:
     image_ref: my-image@sha256:12345 # required
     sbom: my-image.json # optional
     # ... other options removed for readability
```

## Known limitations and alternatives

Due to [Trivy](https://github.com/aquasecurity/trivy-action), you'll receive a simplified dependency graph, as Trivy 
doesn't support Gradle or Maven's dependency resolution. 

Dependency-track integrates with Trivy at runtime, ensuring that vulnerabilities from the Docker container are still detected.

Trivy directly parses the .jar files without access to full dependency resolution details.

Gradle and Maven plugins provide a deeper graph of nested transitive dependencies.
However, if you're using [Distroless](../../explanations/README.md#distroless) images or 
[Chainguard images](../../explanations/README.md#chainguard), updates are managed and kept to a minimum.
 
See [limitations and alternatives](../reference/README.md#known-limitations-and-alternatives) for more information.