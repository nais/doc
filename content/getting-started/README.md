Getting started
===============

## Install required tools
In order to interact with the clusters, you're going to need a kubectl binary.   
To interact with clusters in Google cloud, you're going to need the Google cloud SDK in addition.   
Google's cloud SDK ships with kubectl, so this is the only package you need to install.  
[Download](https://cloud.google.com/sdk/docs/downloads-versioned-archives) the relevant package for your operating system and follow the instructions to get started.   
Make sure you answer yes when prompted to let the installer modify your profile to update your PATH in order to get gclouds binary directory added to your path.
Once the Google cloud SDK is installed, use it to install kubectl as well: `gcloud components install kubectl`

#### Install useful tools
There are several tools that help visualize and simplify kubernetes configuration.
Although not required, they come highly recommended.  
[kubectx](https://github.com/ahmetb/kubectx) - Simplifies changing cluster and namespace context.   
[kubeaware](https://github.com/jhrv/kubeaware) - visualize which cluster and namespace is currently active.

## Cluster access
#### Base cluster access
In order to operate your application(s) on the NAIS platform, you need to ensure you have the base access to the cluster.  
Membership in the Azure AD group `0000-ga-utvikling-pa-laptop` grants base access.

#### Internal clusters
Clone the [kubeconfig](https://github.com/navikt/kubeconfigs.git) (_private_) repository to get a kubeconfig file with the necessary configuration for our internal clusters   
To use this kubeconfig as your default, either symlink the `config` file (or copy if you're on windows) to `~/.kube`, or point the environment variable `KUBECONFIG` to the `config` file.   
The first time you're attempting to communicate with either cluster, you are required to authenticate with Azure AD.
1. Before you can begin using `Kubectl`, you need to authorise with Azure.
1. Switch to a cluster `kubectl config use-context preprod-fss` (or `kubectx preprod-fss`if you've installed kubectx)
1. Run `kubectl get pods` and you will then be asked to authorise with Azure. Go to the address, use the code, and log in with your NAV e-post and NAV-ident password. When your user has been authorised, the shell-command will finish and return a list of pods running in the cluster.

#### Google clusters
> todo
`gcloud auth login`
`gcloud projects list`
log on with your @nav.no address 

#### Access to team resources
Every resource in the cluster is restricted to the team that owns the application.   
In order to gain access, you have to be a member of the relevant group in Azure AD.  



> todo
create new team
add members to existing team
mapping label > group
service user


## Setting up on VDI
If you need to use your VDI to access the clusters, there's a guide to configure [vdi](/content/getting-started/vdi.md)

