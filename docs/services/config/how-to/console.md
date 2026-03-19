---
tags: [config, how-to, console]
---

# Create and manage configs in Console

This how-to guide shows you how to create and manage a [config](../README.md) in the Nais Console.

## Prerequisites

- You're part of a [Nais team](../../../explanations/team.md)

## List configs

1. Open [Nais Console :octicons-link-external-16:](https://console.<<tenant()>>.cloud.nais.io) in your browser
2. Select your team
3. Select the `Config` tab

## Create a config

1. Click `Create Config`
2. Select the environment you want to create the config in
3. Enter a **name** for your config
4. Click `Create`
5. Optionally, add one or more key-value pairs to your newly created config

## Edit a config

1. Select the config you want to edit
2. Add, edit, or delete key-value pairs for the config as desired
3. Click `Save` when you're satisfied with the changes

    After saving, any workloads using the config will automatically restart to receive the updated values.

## Delete a config

1. Select the config you want to delete
2. Click the `Delete` button in the config's details page

    You will be prompted to confirm the deletion.
    Once confirmed, the config will be permanently deleted and no longer available to any workloads.

## Related pages

:dart: Learn [how to use a config in your workload](workload.md)
