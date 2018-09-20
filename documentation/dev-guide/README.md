Getting started
===============

> This guide contains several steps and links specific to developers at NAV. Some of them link to internal information in private repositories. If you're not a developer at NAV, you might want to head over to the [platform](/documentation/platform.md) and the NAIS [contracts](/README.md#contracts).

## Install the necessary tools

We recommend Linux-VDI users to use [utvikler-ansible](https://github.com/navikt/utvikler-ansible) (*this is a private repo only available to developers at NAV*) to set up their images.

For Linux- and Windows-VDI, you need to set up [NAV-proxy](/documentation/dev-guide/README.md#system-environment-variables) before installing the tools.


### Install Kubectl

> Use the Kubernetes command-line tool, kubectl, to deploy and manage applications on Kubernetes. Using kubectl, you can inspect cluster resources; create, delete, and update components; and look at your new cluster and bring up example apps.

Linux and Mac users can use the install guide over at [Kubernetes.io](https://kubernetes.ios/tasks/tools/install-kubectl/) to install Kubectl. Windows users can follow the guide below. All three types of users need to [configure Kubectl](dev-guide/README.md#configure-kubectl) after installation.

What you can and can't do in the clusters are governed by RBAC-rules that are defined in the [Naisible-repo](https://github.com/nais/naisible/blob/master/templates/roles/clusterroles.yaml.j2). This is a bit technical, and it's better to read up on [Kubectl operations](https://kubernetes.ios/reference/kubectl/overview/#operations) over at Kubernetes.io. We also have made a small set of [Kubectl operation examples](/documentation/dev-guide/kubectl_examples.md).


#### Install Kubectl on Windows

1. Download Kubectl from `F:\programvare\kubectl\kubectl.exe`. Put the file where you usually install files
2. Add `kubectl.exe` to the system environment variable `$PATH`
3. Check if everything is working by restarting your shell and running `kubectl`


#### Configure Kubectl

1. Clone [kubeconfigs](https://github.com/navikt/kubeconfigs)(*this is a private repo only available to developers at NAV*)a from Github
2. Point the `KUBECONFIG` environment-variable to the `configs` file in the cloned repo
3. Before you can begin using `Kubectl`, you need to authorise with Azure.
 a. Switch to a cluster `kubectl config use-context preprod-fss`
 b. Run `kubectl get pods` and you will then be asked to authorise with Azure. Go to the address, use the code, and log in with your NAV e-post and NAV-ident password. When your user has been authorised, the shell-command will finish and return a list of pods running in the cluster.


##### Changing passwords

Every time you change your NAV-ident password, you need to reset your Kubeconfigs credentials.

You will get an error similar to the one below:

```text
Failed to acquire a token: refreshing the expired token: refreshing token: adal: Refresh request failed. Status Code = '400'. Response body: {"error":"invalid_grant","error_description":"AADSTS50173: The provided grant has expired due to it being revoked. The user might have changed or reset their password. ...
```

The easiest way to fix this is to run the following commands in the `kubeconfigs`-repo:
```bash
git checkout -- .
git reset
git pull
```

Alternatively you can just remove the values under `user.auth-provider.config` for the following keys, in the `kubeconfigs/config`-yaml file: ´access-token`, `refresh-token`, `expires-in`, `expires-on`.

After that, follow the instruction to [configure kubectl](/documentation/dev-guide/README.md#configure-kubectl).


### Install Docker

> Docker is an open platform for developers and sysadmins to build, ship, and run distributed applications, whether on laptops, data center VMs, or the cloud.

Follow the [install Docker](https:/s.docker.com/install/)-guide for local testing and development.


#### Install Docker on Windows VDI

Since we are running our Windows VDI with virtualisation off, we need to have the Docker daemon running on an external Linux-server or VDI.

1. Install Docker CE by following the guide at [docker.com](https://www.docker.comker-windows)
   * You need to disable `hyper-v`
   * You need to reboot you machine
2. Set system environment variable `DOCKER_HOST` to point to a Linux server running a Docker daemon
   * `DOCKER_HOST=tcp://enlinuxserversomhardockerinstallert:port`


## System environment variables

You need the following variables set in your VDI:

```text
http_proxy=http://webproxy-utvikler.nav.no:8088
https_proxy=http://webproxy-utvikler.nav.no:8088
no_proxy=localhost,127.0.0.1,*.adeo.no,.local,.adeo.no,.nav.no,.aetat.no,.devillo.no,.oera.no,devel
```


## If you have any questions

1. Read the documentation
2. [Contact us](/README.md#contact-us)
