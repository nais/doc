---
title: Secrets Reference
tags: [secrets, reference]
---

# Secrets Reference

This is the reference documentation for [secrets](../README.md) on the NAIS platform.

## Console

Visit [NAIS Console :octicons-link-external-16:](https://console.<<tenant()>>.cloud.nais.io) to find and manage your team's user-defined secrets.

## How-To Guides

:dart: [Get started with secrets in Console](../how-to/console.md)

:dart: [Use a secret in your workload](../how-to/workload.md)

## Workloads

Use a secret in your [workload](../../../workloads/README.md) by referencing them in your `nais.yaml` manifest.

The secret can be made available as environment variables or files.

### Environment Variables

```yaml
spec:
  envFrom:
    - secret: <secret-name>
```

See also:

:books: [Application reference][application]

:books: [NaisJob reference][naisjob]

### Files

```yaml
spec:
  filesFrom:
    - secret: <secret-name>
      mountPath: /var/run/secrets/<secret-name>
```

See also:

:books: [Application reference][application]

:books: [NaisJob reference][naisjob]

[application]: ../../../workloads/application/reference/application-spec.md#envfromsecret
[naisjob]: ../../../workloads/job/reference/naisjob-spec.md#envfromsecret
