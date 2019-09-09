Getting started
===============

This guide will take you through the required tools and permissions that need to be in place for you to be able to operate your own NAIS application(s) directly from your laptop.

## Install [`kubectl`](https://kubernetes.io/docs/tasks/tools/install-kubectl)

`kubectl` is a command-line tool used to manage your Kubernetes resources.

Check out the [official documentation](https://kubernetes.io/docs/tasks/tools/install-kubectl) for instructions on how to install the binaries.

## Setup your [`kubeconfig`](https://kubernetes.io/docs/concepts/configuration/organize-cluster-access-kubeconfig/)

The `kubectl` tool uses a `kubeconfig` file to get the information it needs in order to connect to a cluster. We provide a [pre-made `kubeconfig`](https://github.com/navikt/kubeconfigs.git) file with NAV's [clusters](../clusters). 

`kubectl` will by default look for a file named `config` in the `$HOME/.kube/` folder. You can also override this by having the absolute path of the file in the environment variable `KUBECONFIG`. 

## Connect to ScaleFT

In order to reach our clusters, you have to be connected to the right ScaleFT host. For GCP, it's one host per cluster (`dev-gcp` and `prod-gcp`), for on-premise you select `devWeb02`.

Start `navTunnel` app, click the icon. If you are not authenticated, it will open your browser and prompt you for your credentials. When done, click the icon again and select your cluster (see below)

![Connect ScaleFT](scale_connect.png)

## Authenticate `kubectl`

### On-premise

When connecting to on-premise clusters, you need to authenticate with Azure AD.

```
$ kubectl config use-context prod-fss
Switched to context "prod-fss".

$ kubectl get pods
To sign in, use a web browser to open the page https://microsoft.com/devicelogin and enter the code CR69DPQQZ to authenticate.
```

When prompted like above, go to the address and enter the code. You then log in with your NAV e-mail and  password. 
When done, `kubectl` will update your `kubeconfig`-file with the tokens needed to gain access to the cluster.

### Google Cloud Platform (GCP)

First you need to install `gcloud` following the [instructions](https://cloud.google.com/sdk/docs/#install_the_latest_cloud_tools_version_cloudsdk_current_version) for your platform.

Once installed, you need to authenticate with Google using your NAV e-mail.

```
$ gcloud auth login
```

Make sure you are connected to the right cluster, and verify that it works.

```
$ kubectl config use-context prod-gcp
Switched to context "prod-gcp".
$ kubectl cluster-info
gcp-terraform $ k cluster-info
Kubernetes master is running at https://127.0.0.1:14131
...
```

## Recommended tools

[kubectx](https://github.com/ahmetb/kubectx) - Simplifies changing cluster and namespace context.   
[kubeaware](https://github.com/jhrv/kubeaware) - Visualize which cluster and namespace is currently active.
