---
tags: [command-line, how-to, operate]
---

# Setup command line access

This guide shows you how to set up command line tools for accessing Nais clusters

## Prerequisites

- [naisdevice](../naisdevice/how-to/install.md) installed
- [nais-cli](https://cli.nais.io) installed

## Install gcloud

Follow Googles instructions on how to install [gcloud](https://cloud.google.com/sdk/docs/install) for your OS

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

To verify correct installation of the plugin, do

```shell
% gke-gcloud-auth-plugin --version
Kubernetes v1.34.2+0dd7f7cd0b632699e47ecafa4acc8f77cfc73c06
```

Macos: If this command responds with "command not found" the following configuration needs to
be added to the shell profile (By default ~/.zprofile or ~/.zshrc:

```shell
source "$(brew --prefix)/share/google-cloud-sdk/path.zsh.inc"
source "$(brew --prefix)/share/google-cloud-sdk/completion.zsh.inc"
```

The last command is optional, and enables gcloud completion in the shell.

{%- if tenant() == "nav" %}
## Install kubelogin for access to on-prem clusters

Follow Microsoft's instructions on how to install [kubelogin](https://azure.github.io/kubelogin/install.html) for your OS.
{%- endif %}

## Generate kubeconfig file

Use nais-cli to generate the kubeconfig file that grants access to the Nais clusters.

```shell
nais kubeconfig
```

A successful run will output how many clusters and where the kubeconfig file is written to.

## Install kubectl

Follow the instruction to install [kubectl](https://kubernetes.io/docs/tasks/tools/) for your OS. 
The next step of this guide verify that you have access to our clusters, so you can skip the "Verify kubectl configuration" section in the instructions.

## Verify access

```shell
kubectl --context '<MY-ENV>' get ns
```

If you are unsure about which environments are available, you can list them with:

```shell
kubectl config get-clusters
```
