Getting started
===============

This guide will take you through the required tools and permissions that need to be in place for you to be able to operate your own NAIS application(s). 

## Install [`kubectl`](https://kubernetes.io/docs/tasks/tools/install-kubectl)

`kubectl` is a command-line tool used to manage your Kubernetes resources.

Check out the [official documentation](https://kubernetes.io/docs/tasks/tools/install-kubectl) for instructions on how to install the binaries.

## Setup your [`kubeconfig`](https://kubernetes.io/docs/concepts/configuration/organize-cluster-access-kubeconfig/)

The `kubectl` tool uses a `kubeconfig` file to get the information it needs in order to connect to a cluster. We provide a [pre-made `kubeconfig`](https://github.com/navikt/kubeconfigs.git) file with NAV's [clusters](../clusters). 

`kubectl` will by default look for a file named `config` in the `$HOME/.kube/` folder. You can also override this by having the absolute path of the file in the environment variable `KUBECONFIG`. 

The first time you're attempting to communicate with a cluster, you are required to authenticate with Azure AD.
```
$ kubectl config use-context prod-fss
Switched to context "prod-fss".

$ kubectl get pods
To sign in, use a web browser to open the page https://microsoft.com/devicelogin and enter the code CR69DPQQZ to authenticate.

```
Go to the address, use the code, and log in with your NAV e-post and NAV-ident password. When done, `kubectl` will update your `kubeconfig`-file with the tokens needed to gain access to the cluster. 

## Aquire the `nais:developer` role

This role is granted automatically by being member of the AD-group called "0000-GA-UTVIKLING-FRA-LAPTOP". This is granted by your identity manager (identansvarlig).

This role grants you the base access to the cluster.


## Get access to operate your team's applications

Every resource in the cluster is restricted to the team that owns the application.   
In order to gain access, you have to be a member of your team in Azure AD. This can be done by your team administrator.

> todo
create new team
add members to existing team
mapping label > group
service user

## Recommended tools

[kubectx](https://github.com/ahmetb/kubectx) - Simplifies changing cluster and namespace context.   
[kubeaware](https://github.com/jhrv/kubeaware) - visualize which cluster and namespace is currently active.

## Setting up on VDI
If you need to use your VDI to access the clusters, there's a guide to configure [vdi](/content/getting-started/vdi.md)

