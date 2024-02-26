# Secrets

This how-to guide shows you how to create a [secret](../explanation/secrets.md) and use it in your [workload](../explanation/workloads/README.md).

## 0. Prerequisites

- You're part of a [NAIS team](./team.md)
- A Github repository where the NAIS team has access
- The repository contains a valid workload manifest (`nais.yaml`)

## 1. Create a secret

1. Open [NAIS console](https://console.<<tenant()>>.cloud.nais.io) in your browser and select your team
2. Select the `Secrets` tab
3. Click `Create Secret`
4. Choose the environment you want to create the secret in
5. Choose a **name** for your secret and click `Create`
6. Optionally, add a key-value pair to your newly created secret

## 2. Use the secret in your workload

1. Add a reference to the secret in the workload's `nais.yaml` [manifest](../reference/secrets.md#environment-variables).

    For a secret named `cool-cat`, the manifest should contain these additional lines:

    ```yaml title="nais.yaml" hl_lines="2-3"
    spec:
      envFrom:
        - secret: cool-cat
    ```

    The `Copy manifest` button in NAIS Console generates a snippet equivalent to the above.

2. Commit and push the changes to version control, and deploy your workload as usual.

All key-value pairs in the secret are now available in your workload's runtime as environment variables.

## 3. Update the secret

Add, edit, or delete key-value pairs for the secret in Console as desired.

Workloads will automatically pick up any changes made to the secret, as long as the manifest still references the secret.
