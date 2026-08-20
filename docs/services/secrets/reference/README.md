---
tags: [secrets, reference]
---

# Secrets reference

This is the reference documentation for [secrets](../README.md) on the Nais platform.

## Console

Visit [Nais Console](https://console.<<tenant()>>.cloud.nais.io) to find and manage your team's user-defined secrets.

## CLI

Use [Nais CLI](https://cli.nais.io/nais_secret.html) to interact with or manage secrets.

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
