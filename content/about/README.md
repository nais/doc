# About

NAIS is an application platform built on [Kubernetes](https://kubernetes.io/) that provide developers the tools they need to develop, deploy and run their applications.

When we're dealing with a fleet of applications that have overlapping requirements, it doesn't make any sense for each application to handle everything individually.
Thus there's a NAIS eco-system that provide common solutions to common requirements, such as logging, monitoring, metrics, deployment and operations.

## Runtime environment
Traditionally applications have been built to run on a designated application server, where the runtime environment and the application's modules and libraries are provided by the server.
As NAIS is a [Kubernetes](https://kubernetes.io/) based platform, the application and all its deplendencies are all bundled as a [docker container](https://www.infoworld.com/article/3204171/docker/what-is-docker-docker-containers-explained.html).
Since the application and all it's dependencies are contained as a single unit, we've achieved movability and portability that was previously unobtainable.
With this newfound freedom, we can make use of a container orchestrator system such as [Kubernetes](https://kubernetes.io/) to handle the application operation for us.
[Kubernetes](https://kubernetes.io/) will handle [scaling](https://kubernetes.io/docs/tasks/run-application/horizontal-pod-autoscale/) our application when demands are changing, [detect and restart](https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-probes/) if application failures occur and make sure the application is always [accessible](https://kubernetes.io/docs/concepts/services-networking/ingress/) no matter where or how many instances of the application is running.

## Configuration
As the operation of the application is handed over to the platform, we need to give the platform some insructions on how to operate.
In order to fully automate the applications operations, NAIS make use of many of the different mechanisms [Kubernetes](https://kubernetes.io/) has to offer; all of which require individual configuration.
Since the configuration of these mechanisms are the same for all applications, the applications can express all its demands in a simple (configuration format)[https://github.com/nais/naiserator/blob/master/pkg/apis/naiserator/v1alpha1/application.yaml], and NAIS will take care of [building the instructions](https://github.com/nais/naiserator) for [Kubernetes](https://kubernetes.io/)

What's NAIS about this platform, is:
- nais.yaml
- naiserator
  - autoscaling
  - secrets
    -vault
  - ingresses
    - bigip
  - logging
    - contracts
    - kibana
  - metrics
    - prometheus
    - grafana


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
