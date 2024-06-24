---
tags: [secrets, how-to]
---

# Advanced: Secrets with binary data

[NAIS Console](console.md) only supports secrets with string values.
You can work around this by Base64-encoding the binary data and store the resulting string, though it also requires that your application does the equivalent decoding.

If you instead want to manage binary data directly, you can use the command line interface (CLI) to create and manage secrets with binary data.

This how-to guides you through creating and managing a secret with binary data using the command line.

## Prerequisites

- You're part of a [NAIS team](../../../explanations/team.md)
- You have [configured command line access](../../../operate/how-to/command-line-access.md) for your machine

## Create the secret

Create a secret containing binary files using the `kubectl` command-line tool.

For a secret named `cool-cat`, the command should look like this:

```shell
kubectl create secret generic cool-cat \
  --from-file=cool-cat.jks=/path/to/cool-cat.jks \
  --context $NAIS_ENVIRONMENT \
  --namespace $NAIS_TEAM
```

- The secret contains a single key, namely `cool-cat.jks`.
- The value of the key is path to file, namely `/path/to/cool-cat.jks`.
- The `$NAIS_ENVIRONMENT` variable is a placeholder for the [environment](../../../workloads/reference/environments.md) you're targeting.
- The `$NAIS_TEAM` variable is a placeholder for your team.

## Update the secret

To update the secret, you will need to delete and recreate it with the new files.

For a secret named `cool-cat`, delete the secret with the following command:

```shell
kubectl delete secret cool-cat \
  --context $NAIS_ENVIRONMENT \
  --namespace $NAIS_TEAM
```

and then recreate the secret with the updated files:

```shell
kubectl create secret generic cool-cat \
  --from-file=cool-cat.jks=/path/to/cool-cat.jks \
  --context $NAIS_ENVIRONMENT \
  --namespace $NAIS_TEAM
```

Any workloads that use the secret must be manually restarted to pick up the changes.

## Related pages

:dart: Learn how to [use a secret in your workload](workload.md)
