---
tags: [command-line, how-to, operate]
---

# Setup command line access

This guide shows you how to set up command line tools for accessing NAIS clusters

## Prerequisites

- [naisdevice](../naisdevice/how-to/install.md) installed
- [nais-cli](../cli/how-to/install.md) installed

## Install gcloud

Follow Googles instructions on how to install [gcloud](https://cloud.google.com/sdk/docs/install) for your OS

## Install kubectl

Follow the instruction to install [kubectl](https://kubernetes.io/docs/tasks/tools/) for your OS

## Authenticate using gcloud

```shell
gcloud auth login --update-adc
```

This will open your browser.
Follow the instructions to authenticate using the email from your organization.

When successfully authenticated, you will be shown "You are now authenitcated with the gcloud CLI!" in your browser.
You can now close the browser window.

You will also need to install a plugin in order to authenticate to the Kubernetes clusters:

```shell
gcloud components install gke-gcloud-auth-plugin
```

## Generate kubeconfig file

Use nais-cli to generate the kubeconfig file that grants access to the NAIS clusters.

```shell
nais kubeconfig
```

A successful run will output how many clusters and where the kubeconfig file is written to.

## Verify access

```shell
kubectl --context '<MY-ENV>' get ns
```

If you are unsure about which environments are available, you can list them with:

```shell
kubectl config get-clusters
```
