---
tags: [workloads, explanation, service, discovery]
---

# Service Discovery

Applications deployed to Kubernetes are exposed through what is known as a [:octicons-link-external-16:`Service`][k8s-service-discovery].
This is an internal address that allows for direct communication within a [Kubernetes environment / cluster](environment.md) without having to go through an external ingress, load balancer, or proxy.

```mermaid
graph LR
  accTitle: Service Discovery
  accDescr: The diagram shows how App A can communicate with App B directly.
  app-a[App A] --http://app-b --> app-b[App B]
```

Service discovery is the recommended way to communicate between applications in the environment.
This avoids having to [expose your application to the outside world](../application/how-to/expose.md), and allows for direct communication between applications with lower latency.

Each [application](../application/README.md) is automatically provisioned with a service with the same name as the application itself.

The service provides a well-known, stable internal address for a set of pods.
This means that if a pod dies, moves or is upgraded, the `Service` will continue to automatically route requests to the remaining healthy pods.

## Related pages

:dart: Learn how to [use service discovery to communicate with other workloads](../how-to/communication.md).

:dart: Learn how to [set up access policies for your workloads](../how-to/access-policies.md).

[k8s-service-discovery]: https://kubernetes.io/docs/concepts/services-networking/service/
