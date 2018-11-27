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
Since the configuration of these mechanisms are the same for all applications, the applications can express all its demands in a simple [configuration format](https://github.com/nais/naiserator/blob/master/pkg/apis/naiserator/v1alpha1/application.yaml), and NAIS will take care of [building the instructions](https://github.com/nais/naiserator) for [Kubernetes](https://kubernetes.io/)

## Observability
Even though the operations are handled by the platform, we still want to observe how our applications are doing.
Therefore the platform provides mechanisms that automatically gather [logs](https://github.com/nais/nais-logd) and [metrics](https://prometheus.io/), making them both easily accessible via [kibana](https://logs.adeo.no) and [grafana](https://grafana.adeo.no) respectively
