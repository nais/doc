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

The [salsa](https://github.com/nais/salsa) action fulfills the requirements
for [level 2](https://slsa.dev/spec/v0.1/levels) and shows more
trustworthiness in the build, builders are
source-aware, and signatures are used to prevent provenance being tampered with.

salsa:

* creates and signs an [attestation](https://github.com/slsa-framework/slsa/blob/main/controls/attestations.md)
* verifies the signature
* uploads attestation to the package registry

### Usage

Simply add [google-auth action](https://github.com/google-github-actions/auth)
and [salsa action](https://github.com/nais/salsa) to your CI.

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

The action currently [supports](https://github.com/nais/salsa#support) build tools specified.

#### Known limitations

* No support for projects with internal/private dependencies

You are still able to create a provenance by setting [with.dependencies](https://github.com/nais/salsa#customizing) to
false

```yaml
      - name: Provenance, upload and sign attestation
        uses: nais/salsa@v0.1
        with:
          key: ${{ env.KEY }}
          docker_pwd: ${{ secrets.GITHUB_TOKEN }}
          dependencies: false
```

* No support for digest over [dependencies](https://github.com/nais/salsa#build-tools) for
  php projects 


