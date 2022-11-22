---
description: Github action that helps to secure supply chain for software artifacts.
---

# Salsa

!!! info "Status: Beta"
    This feature is only in a beta.

    **Experimental**: users report that this component is working, but it needs a broader audience to be battle-tested properly.

    Report any issues to the #nais channel on Slack.

### What is SLSA

[SLSA](https://slsa.dev/) is short for _Supply chain Levels for Software Artifacts_ pronounced `salsa`.

It’s a security framework, a check-list of standards and controls to prevent tampering, improve integrity, and secure
packages and infrastructure in our projects.

## Action
The [salsa](https://github.com/nais/salsa) action generates signed [provenance](https://slsa.dev/provenance/v0.2) about a build and its
related artifacts and dependencies. Provenance is an attestation (a signed "software bill of materials") about a software artifact or collection of artifacts, documenting how an artifact was produced - all in a common format.

The action implements the [level 3](https://slsa.dev/spec/v0.1/levels) requirements of
the [SLSA Framework](https://slsa.dev) (as long as it is run in an ephemeral environment), producing a signed software [attestation](https://github.com/slsa-framework/slsa/blob/main/controls/attestations.md) of your build and dependencies. 

The attestation is signed and uploaded to your container registry using [cosign](https://github.com/sigstore/cosign)
and can be verified by the salsa cli or using the `cosign verify-attestation` command.

### Usage

Simply add [google-auth action](https://github.com/google-github-actions/auth)
and [salsa action](https://github.com/nais/salsa) to your workflow.

```yaml
      - name: Authenticate to Google Cloud
        uses: google-github-actions/auth@v0
        with:
          credentials_json: ${{ secrets.SALSA_CREDENTIALS }}

      - name: Provenance, upload and sign attestation
        uses: nais/salsa@v0.1
        with:
          key: ${{ secrets.SALSA_KMS_KEY }}
          docker_pwd: ${{ secrets.GITHUB_TOKEN }
```

### Github Secrets

`SALSA_CREDENTIALS` and `SALSA_KMS_KEY` are organization secrets, each GitHub org (nais and navikt) is configured with
their own set.

### Language support

The action currently supports til following list of [languages/build tools](https://github.com/nais/salsa#supported-build-tools)

#### Known limitations

* No support for projects with internal/private dependencies

You are still able to create a provenance by setting [with.dependencies](https://github.com/nais/salsa#customizing) to
false

```yaml
      - name: Provenance, upload and sign attestation
        uses: nais/salsa@v0.1
        with:
          key: ${{ secrets.SALSA_KMS_KEY }}
          docker_pwd: ${{ secrets.GITHUB_TOKEN }}
          dependencies: false
```


