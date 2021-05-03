# Tracing

With program flow distributed across many microservices, the ability to observe the different services in context can become a valuable tool for development and operations. For the GCP clusters, NAIS offers a rich toolkit for this.

The simplest way to get an overview is to observe the linkerd service mesh using the dashboard. 

## Visualizing service mesh with Linkerd dashboard
Linkerd can be reached at linkerd._cluster-name_.nais.io, eg. [linkerd.dev-gcp.nais.io](https://linkerd.dev-gcp.nais.io).
NAIS leverages the [Linkerd distributed tracing](https://linkerd.io/2.10/features/distributed-tracing/) and Linkerd dashboard to give developers a visualization of the service mesh and its general health. Linkerd will also give a quick graphical overview of failing HTTP calls.

