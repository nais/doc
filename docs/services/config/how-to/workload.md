---
tags: [workloads, how-to, config]
---

# Use a config in your workload

This how-to guide shows you how to reference and use a [config](../README.md)
in your [workload](../../../workloads/README.md).

A config can be made available as environment variables or files, or both.

## Prerequisites

- You're part of a [Nais team](../../../explanations/team.md)
- You have previously [created a config](console.md#create-a-config) for your team
- A Github repository where the Nais team has access
- The repository contains a valid workload manifest (`nais.yaml`)

## Expose config as environment variables

1. Add a reference to the config in the workload's `nais.yaml` manifest.

    For a config named `my-config`, the manifest should contain these additional lines:

    ```yaml title="nais.yaml" hl_lines="2-3"
    spec:
      envFrom:
        - configmap: my-config
    ```

2. Commit and push the changes to version control, and deploy your workload as usual.
3. Each key-value pair is now available in your workload's runtime as an environment variable.

    For example, for a key named `SOME_KEY`:

    ```shell
    SOME_KEY=some-value
    ```

## Mount config as files

1. Add a reference to the config in the workload's `nais.yaml` manifest.

    For a config named `my-config`, the manifest should contain these additional lines:

    ```yaml title="nais.yaml" hl_lines="2-4"
     spec:
       filesFrom:
        - configmap: my-config
          mountPath: /var/run/configmaps/my-config
    ```

2. Commit and push the changes to version control, and deploy your workload as usual.
3. Each key-value pair is now available as a file at the specified mount path, e.g:

    ```shell
    /var/run/configmaps/my-config/
    ```

    For example, a key named `some-key` will be available as a file at the following path:

    ```shell
    /var/run/configmaps/my-config/some-key
    ```
