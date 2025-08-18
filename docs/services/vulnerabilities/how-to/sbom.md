---
tags: [attestation, sbom, how-to]
---

# Generate SBOM

Simply add [nais/docker-build-push](https://github.com/nais/docker-build-push) to your workflow.

```yaml
 - uses: nais/docker-build-push@v0
   id: docker-push
   with:
     team: myteam # required
     salsa: true # optional, defaults to true
     # ... other options removed for readability
```

??? note Opt-out
    Opt-out from salsa

    If you want to opt-out from salsa you can set the salsa input to false

    ```yaml
    salsa: false
    ```

### Attest sign

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
