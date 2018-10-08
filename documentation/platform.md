Platform
========

We can describe four distinct "layers" of NAIS: [infrastructure](/about.md#infrastructure), [kubernetes](/about.md#kubernetes), [platform](/about.md#platform), and [application](/about.md#application)

![overview](/documentation/media/platform_overview.png)


## Infrastructure

We are currently running all our clusters on Virtual Machines with both RedHat 7 and CoreOS in our own data centers, but working on migrating the platform to the public cloud.


## Kubernetes

When we started building NAIS, we used best practices and ideas from both the Kubernetes [kubeadm](https://github.com/kubernetes/kubeadm) project and from Kelsey Hightower's [Kubernetes the hard way](https://github.com/kelseyhightower/kubernetes-the-hard-way).

We then transcribed what we learned into yaml format, which enabled us to rebuild, expand and tear down clusters with the use of [Ansible playbooks](http:/docs.ansible.com/ansible/latest/playbooks.html). We call these playbooks [Naisible](https://github.com/nais/naisible).

Once we have run ansible on a set of nodes, we have a fully functioning [Kubernetes](https://kubernetes.io/) cluster.

The primary cluster components are:
* [flannel](https://github.com/coreos/flannel), providing a VXLAN overlay network,
* [coreDNS](https://github.com/coredns/coredns), a fast and flexible DNS server
* [træfik](https://traefik.io/), an in cluster L7 proxy which automatically routes traffic to the applications in the cluster
* [helm](https://github.com/kubernetes/helm), a kubernetes package manager we rely on to install the platform layer


## Platform

We want our developers to have full control of their application and how it behaves, so we have built an ecosystem around a set of [tools](/documentation/platform.md#platform-tools) aimed to give full insight. The interface between the application and the platform is regulated through a set of minimal [contracts](/#contracts).

We use [Landscaper](https://github.com/Eneco/landscaper) to install and maintain the state of the tools in each of our clusters.


### Platform tools

Once an application is [deployed](/documentation/dev-guide/naisd.md#deploy):
* Metrics will be gathered by [Prometheus](https://prometheus.io/), stored in [Influxdb](https://www.influxdata.com/time-series-platform/influxdb/), then made available via [Grafana](https://grafana.com/) at [grafana.adeo.no](https://grafana.adeo.no/)
* Logs will be gathered by [Fluentd](https://www.fluentd.org/), forwarded to and indexed by [Elastic](https://www.elastic.co/), before becoming available to the users via [Kibana](https://www.elastic.co/products/kibana) at [logs.adeo.no](https://logs.adeo.no/)
* Infrastructure related metrics is collected by [Sensu](https://sensuapp.org/), stored in [influxDB](https://www.influxdata.com/time-series-platform/influxdb/), then made available via [Grafana](https://grafana.com/)


## Application

In order for the application developers to remain in control of the application and its runtime, the developers will produce a [Docker image](https:/docs.docker.com/engine/reference/commandline/images/) containing their application and its dependencies.

This is how the developers can be sure that their application have the exact same runtime conditions at all times.

There are [deployment](/documentation/dev-guide/naisd.md) mechanisms in the NAIS cluster that takes care of creating the neccessary Kubernetes resources required to ensure the application's configuration, stability, scalability and exposure based on a simple HTTP POST.
