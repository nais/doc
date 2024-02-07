# Communicating inside the environment

This guide will show you how to communicate with other applications inside the same environment.

## 0. Prerequisites
- Working [access policies](./access-policies.md) for the applications you want to communicate with.

## 1. Identify the endpoint you want to communicate with

To identity the endpoint of the workload we are communicating with, we need to know it's `name` and what `namespace` it's running in.

If the workload you are calling is in the same namespace, you can reach it by calling it's name directly using HTTP like so:

```plaintext
http://<workload-name>
```

If the workload is running in another team's namespace, you need to specify the namespace as well:

```plaintext
http://<workload-name>.<namespace>
```

With this endpoint, you can now call the workload using HTTP from your own workload.
