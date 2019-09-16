# vdi

> This guide contains several steps and links specific to developers at NAV. Some of them link to internal information in private repositories.

## Install the necessary tools

We recommend Linux-VDI users to use [utvikler-ansible](https://github.com/navikt/utvikler-ansible) to set up their images.

For Linux- and Windows-VDI, you need to set up [NAV-proxy](vdi.md#system-environment-variables) before installing the tools.

### Install Kubectl

> Use the Kubernetes command-line tool, kubectl, to deploy and manage applications on Kubernetes. Using kubectl, you can inspect cluster resources; create, delete, and update components; and look at your new cluster and bring up example apps.

Linux and Mac users can use the install guide over at [Kubernetes.io](https://kubernetes.io/docs/tasks/tools/install-kubectl/) to install Kubectl. Windows users can follow the guide below. All three types of users need to [configure Kubectl](./#configure-kubectl) after installation.

What you can and can't do in the clusters are governed by RBAC-rules that are defined in the [Naisible-repo](https://github.com/nais/naisible/blob/master/files/roles/clusterroles.yaml). This is a bit technical, and it's better to read up on [Kubectl operations](https://kubernetes.io/docs/reference/kubectl/overview/#operations) over at Kubernetes.io. We also have made a small set of [Kubectl operation examples](kubectl_examples.md).

#### Install Kubectl on Windows

1. Download Kubectl from `F:\programvare\kubectl\kubectl.exe`. Put the file where you usually install files
2. Add `kubectl.exe` to the system environment variable `$PATH`
3. Check if everything is working by restarting your shell and running `kubectl`

#### Configure Kubectl

1. Clone [kubeconfigs](https://github.com/navikt/kubeconfigs) from Github
2. Point the `KUBECONFIG` environment-variable to the `config` file in the cloned repo\*
3. Before you can begin using `Kubectl`, you need to authorise with Azure.

   a. Switch to a cluster `kubectl config use-context preprod-fss`

   b. Run `kubectl get pods` and you will then be asked to authorise with Azure. Go to the address, use the code, and log in with your NAV e-post and NAV-ident password. When your user has been authorised, the shell-command will finish and return a list of pods running in the cluster.

**Changing passwords**

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

Alternatively you can just remove the values under `user.auth-provider.config` for the following keys, in the `kubeconfigs/config`-yaml file: `access-token`, `refresh-token`, `expires-in`, `expires-on`.

After that, follow the instruction to [configure kubectl](install-tools.md#configure-kubectl).

PS: Some users have had to change Kubernetes context/cluster for the change to take effect.

### Install Docker

> Docker is an open platform for developers and sysadmins to build, ship, and run distributed applications, whether on laptops, data center VMs, or the cloud.

Follow the [install Docker](https://docs.docker.com/install/)-guide for local testing and development.

#### Docker on Windows VDI requires virtualization

To be able to run the Docker daemon that comes with Docker Desktop \(formerly known as Docker For Windows\) in Nav's Windows virtual machine images we need to enable virtualization \(Hyper-V\) in the image.

You can ask to have virtualization enabled in the Slack channel \#tech\_virtualisering. You need to provide the name of the virtual machine, which you will find from within the image &gt; Windows &gt; Kontrollpanel &gt; System og sikkerhet &gt; System. Enabling virtualization requires reboot of the image.

Verify by opening Windows &gt; Aktiver eller deaktiver Windows-funksjoner, find "Hyper-V" and see that all it's checkboxes are enabled.

## System environment variables

You need the following variables set in your VDI:

```text
http_proxy=http://webproxy-utvikler.nav.no:8088
https_proxy=http://webproxy-utvikler.nav.no:8088
no_proxy=localhost,127.0.0.1,*.adeo.no,.local,.adeo.no,.nav.no,.aetat.no,.devillo.no,.oera.no,devel,.nais.io
```

