# Command line access

This guide shows you how to set up command line tools for accessing NAIS clusters

## Setup
### 0. Prerequisites

- [naisdevice](../naisdevice/install.md) installed
- [nais-cli](../nais-cli/install.md) installed

### 1. Install gcloud

Follow Googles instructions on how to install [Gcloud](https://cloud.google.com/sdk/docs/install) for your OS

### 2. Install kubectl

Follow the instruction to install [kubectl](https://kubernetes.io/docs/tasks/tools/) for your OS

### 3. Authenticate using gcloud

```shell
gcloud auth login --update-adc
```

This will open your browser.
Follow the instructions to authenticate using the email from your organization.
When successfully authenticated, you will be shown "You are now authenitcated with the gcloud CLI!" in your browser.
You can now close the browser window.

### 4. Generate kubeconfig file

Use nais-cli to generate the kubeconfig file that grants access to the NAIS clusters.

```shell
nais kubeconfig
```

A successful run will output how many clusters and where the kubeconfig file is written to.

### 5. Verify access

```shell
kubectl --context '<MY-ENV>' get ns
```

If you are unsure about which clusters are available, you can list them with:

```shell
kubectl config get-clusters
```

If you experience any issues, please refer to the [troubleshooting](./troubleshooting.md) guide.
