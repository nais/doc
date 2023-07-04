# Access from laptop

This guide will take you through the required tools and permissions that need to be in place for you to be able to operate your own NAIS application directly from your laptop.

## Set up a team

The primary unit of access is a _team_, whose origin lies in [NAIS teams](https://teams.nav.cloud.nais.io).
Each team is given its own namespace with the same name as the team.
The team will have unrestricted access to all Kubernetes assets in that namespace.

See [creating a new team](teams.md#creating-a-new-team) to get started with teams.
After creating a new team, you should have access to all clusters.

!!! info "You're probably part of an existing team"
    If this is your first time here, chances are that you're already part of a team in the context of NAIS.
    Please speak with your colleagues in order to figure this out. You can also log in to NAIS console and check.

## Install [naisdevice](../device/README.md)

naisdevice ensures that your laptop meets NAVs requirements before allowing access to internal resources such as our NAIS clusters. 
Install by following the [naisdevice installation guide](../device/install.md).

## Install [nais-cli](../cli/README.md)

nais-cli is a simple CLI application that developers in NAV can use.
Install by following the [nais-cli installation guide](../nais/install.md).

## Install [`kubectl`](https://kubernetes.io/docs/tasks/tools/install-kubectl)

`kubectl` is a command-line tool used to manage your Kubernetes resources.

Check out [`kubectl´s` official documentation](https://kubernetes.io/docs/tasks/tools/install-kubectl) for instructions on how to install the binaries.

Remember that `kubectl` is supported within one minor version (older or newer) of `kube-apiserver`.
This is called [`version skew`](https://kubernetes.io/releases/version-skew-policy/#kubectl). 
[On-prem version is shown in Grafana - clusters](https://grafana.nais.io/d/NOlZDT7nk/clusters).

Using `brew` to manage `kubectl` will make it troublesome to be within the version skew, as it's hard to downgrade `kubectl` to older versions.
Therefor we recommend installing `kubectl` manually, or through tools like [asdf](https://asdf-vm.com/).

## Setup your [`kubeconfig`](https://kubernetes.io/docs/concepts/configuration/organize-cluster-access-kubeconfig/)

The `kubectl` tool uses a `kubeconfig` file to get the information it needs in order to connect to a cluster.
We provide the command [nais kubeconfig](../cli/commands/kubeconfig.md) to set up the necessary clusters.
`kubectl` will by default look for a file named `config` in the `$HOME/.kube/` folder.

## Authenticate `kubectl`

### Google Cloud Platform \(GCP\)

Before following these steps, [make sure your team is enabled for Google Cloud Platform](teams.md).

You will also need to perform a self-service step to synchronize your user from Azure AD to Google Cloud Platform. This can be done by following these steps:

1. [Login to My Apps > Add Application](https://account.activedirectory.windowsazure.com/r#/addApplications)
3. Locate "Google Cloud Platform", and click on the icon

After you have done this your user will be synced to Google Cloud Platform. The sync is not instantaneous, but usually does not take more than a few minutes.

First you need to [install `gcloud`](https://cloud.google.com/sdk/docs/install) following the instructions for your platform.

Once installed, you need to authenticate with Google using your NAV e-mail.

```bash
$ gcloud auth login
```

You will also need to install a plugin in order to authenticate to the Kubernetes clusters:

```bash
$ gcloud components install gke-gcloud-auth-plugin
```

Then, select a cluster:

```bash
$ kubectl config use-context prod-gcp

Switched to context "prod-gcp".
```

And verify that you're connected:

```bash
$ kubectl cluster-info

Kubernetes control plane is running at https://[...]
...
```

### On-premise

When connecting to on-premise clusters, you need to authenticate with Azure AD.

```bash
$ kubectl config use-context prod-fss
Switched to context "prod-fss".

$ kubectl get pods
To sign in, use a web browser to open the page https://microsoft.com/devicelogin and enter the code CR69DPQQZ to authenticate.
```

When prompted like above, go to the address and enter the code. You then log in with your NAV e-mail and password. When done, `kubectl` will update your `kubeconfig`-file with the tokens needed to gain access to the cluster.

## Recommended tools

* [kubectx](https://github.com/ahmetb/kubectx) - Simplifies changing cluster and namespace context.
* [kubeaware](https://github.com/jhrv/kubeaware) - Visualize which cluster and namespace is currently active.
* [Starship](https://starship.rs/) - Visualize which cluster and namespace is currently active in your terminal prompt, amongst many other things. [Kubernetes specific config](https://starship.rs/config/#kubernetes)
* [emacs-kubectx-mode](https://github.com/terjesannum/emacs-kubectx-mode) - Switch kubectl context and namespace in Emacs and display current setting in mode line.

