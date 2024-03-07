# Use a secret in your workloads

This how-to guide shows you how to reference and use a [secret](../../explanation/secrets.md)
in your [workload](../../explanation/workloads/README.md).

A secret can be made available as environment variables or files, or both.

## Prerequisites

- You're part of a [NAIS team](../team.md)
- You have previously [created a secret](console.md#create-a-secret) for your team
- A Github repository where the NAIS team has access
- The repository contains a valid workload manifest (`nais.yaml`)

## Expose secret as environment variables

1. Add a reference to the secret in the workload's `nais.yaml` manifest.

    For a secret named `cool-cat`, the manifest should contain these additional lines:

    ```yaml title="nais.yaml" hl_lines="2-3"
    spec:
      envFrom:
        - secret: cool-cat
    ```

2. Commit and push the changes to version control, and deploy your workload as usual.
3. Each key-value pair is now available in your workload's runtime as an environment variable.

    For example, for a key named `SOME_KEY`:

    ```shell
    SOME_KEY=some-value
    ```

## Mount secret as files

1. Add a reference to the secret in the workload's `nais.yaml` manifest.

    For a secret named `cool-cat`, the manifest should contain these additional lines:

    ```yaml title="nais.yaml" hl_lines="2-4"
     spec:
       filesFrom:
        - secret: cool-cat
          mountPath: /var/run/secrets/cool-cat
    ```

2. Commit and push the changes to version control, and deploy your workload as usual.
3. Each key-value pair is now available as a file in your workload the specified mount path, e.g:

    ```shell
    /var/run/secrets/cool-cat/
    ```

    For example, a key named `some-key` will be available as a file at the following path:

    ```shell
    /var/run/secrets/cool-cat/some-key
    ```
