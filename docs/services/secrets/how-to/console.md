---
tags: [secrets, how-to, console]
---

# Create and manage secrets in Console

This how-to guide shows you how to create and manage a [secret](../README.md) in the NAIS Console.

## Prerequisites

- You're part of a [NAIS team](../../../explanations/team.md)

## List secrets

1. Open [NAIS console :octicons-link-external-16:](https://console.<<tenant()>>.cloud.nais.io) in your browser
2. Select your team
3. Select the `Secrets` tab

## Create a secret

1. Click `Create Secret`
2. Select the environment you want to create the secret in
3. Enter a **name** for your secret
4. Click `Create`
5. Optionally, add one or more key-value pairs to your newly created secret

## Edit a secret

1. Select the secret you want to edit
2. Add, edit, or delete key-value pairs for the secret as desired
3. Click `Save` when you're satisfied with the changes

    After saving, any workloads using the secret will automatically restart to receive the updated secret values.

## Delete a secret

1. Select the secret you want to delete
2. Click the `Delete` button in the secret's details page

    You will be prompted to confirm the deletion.
    Once confirmed, the secret will be permanently deleted and no longer available to any workloads.

## Related pages

:dart: Learn [how to use a secret in your workload](workload.md)
