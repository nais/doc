---
tags: [config, reference]
---

# Config reference

This is the reference documentation for [configs](../README.md) on the Nais platform.

## Console

Visit [Nais Console :octicons-link-external-16:](https://console.<<tenant()>>.cloud.nais.io) to find and manage your team's configs.

## Workloads

Use a config in your [workload](../../../workloads/README.md) by referencing them in your `nais.yaml` manifest.

The config can be made available as environment variables or files.

### Environment Variables

```yaml
spec:
  envFrom:
    - configmap: <config-name>
```

See also:

:books: [Application reference][application]

:books: [NaisJob reference][naisjob]

### Files

```yaml
spec:
  filesFrom:
    - configmap: <config-name>
      mountPath: /var/run/configmaps/<config-name>
```

See also:

:books: [Application reference][application]

:books: [NaisJob reference][naisjob]

[application]: ../../../workloads/application/reference/application-spec.md#envfromconfigmap
[naisjob]: ../../../workloads/job/reference/naisjob-spec.md#envfromconfigmap
