# About

NAIS is an application platform built to increase development speed by providing our developers with the best possible tools to develop, test and run their applications.

There are many excellent Open Source tools available today; in fact, the possibilities are so many that just wrapping your head around the available options is quite a daunting task. 

It didn't make sense that all of our developers should spend their time figuring out the best combination of tools individually, which is why we created NAIS.

NAIS is a collection of the Open Source tools we have found best suited to deploy, run, monitor and analyze NAVs applications, as well as the tools we have created to build and maintain the platform itself.

## Platform layers
We can describe four distinct "layers" of NAIS: [infrastructure](/about#infrastructure), [kubernetes](/about#kubernetes), [platform](/about#platform) and [application](/about#application)
![overview](/_media/overview.png)

### Infrastructure
We are currently running all our clusters on Virtual Machines with RedHat 7 in our own data centers, but migrating to either physical hardware or cloud based infrastructure on any minimalistic Operating System is a fairly trivial task; and something we will most likely do in the near future.

### Kubernetes
When we started building NAIS, we used best practices and ideas from both the Kubernetes [kubeadm](https://github.com/kubernetes/kubeadm) project and from Keysey Hightower's [Kubernetes the hard way](https://github.com/kelseyhightower/kubernetes-the-hard-way)
We then transcribed what we learned into yaml format, which enabled us to rebuild, expand and tear down clusters with the use of [ansible playbooks](http://docs.ansible.com/ansible/latest/playbooks.html). We call these playbooks [naisible](/naisible)

Once we have run ansible on a set of nodes, we have a fully functioning [kubernetes](https://kubernetes.io/) cluster.
The primary cluster components are:
* [flannel](https://github.com/coreos/flannel), providing a VXLAN overlay network,
* [coreDNS](https://github.com/coredns/coredns), a fast and flexible DNS server
* [træfik](https://traefik.io/), an in cluster L7 proxy which automatically routes traffic to the applications in the cluster
* [helm](https://github.com/kubernetes/helm), a kubernetes package manager we rely on to install the [platform](/platform) layer
 
Further details about Naisible and the components that make up the kubernetes layer available [here](/kubernetes)

### Platform
We want our developers to have full control of their applicaiton and how it behaves, so we have built an ecosystem around a set of [tools](/about#platform-tools) aimed to give full insight. The interface between the application and the platform is regulated through a set of minimal [contracts](/contracts).
We use [Landscaper](https://github.com/Eneco/landscaper) to install and maintain the state of the tools in each of our clusters.
##### Platform tools
Once an application is [deployed](/deployment):
* Metrics will be gathered by [prometheus](https://prometheus.io/), then made available via [grafana](https://grafana.com/)
* Logs will be gathered by [fluentd](https://www.fluentd.org/) and forwarded to and indexed by [elastic](https://www.elastic.co/) before becoming available to the users via [kibana](https://www.elastic.co/products/kibana)
* Infrastructure related metrics is collected by [sensu](https://sensuapp.org/) and stored in [influxDB]() and accessible via [grafana](https://grafana.com/)


### Application
In order for the application developers to remain in control of the application and its runtime, the developers will produce a [docker image](https://docs.docker.com/engine/reference/commandline/images/) containing their application and its dependencies. 
This is how the developers can be sure that their application have the exact same runtime conditions at all times.
There are [deployment](/deployment) mechanisms in the NAIS cluster that takes care of creating the neccessary kubernetes resources required to ensure the application's configuration, stability, scalability and exposure based on a simple HTTP POST.
 