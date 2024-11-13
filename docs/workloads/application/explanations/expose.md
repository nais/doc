---
tags: [application, explanation, ingress, service-discovery]
---

# Exposing your application

What good is an application if no one can reach it?

NAIS tries to make it easy to expose your application to the correct audience.
Your audience may be other applications within the same [environment](../../explanations/environment.md), or it may be humans or machines on the outside.

## Service discovery

If your audience is other applications within the same environment, they can communicate with your application directly by using _service discovery_.

Applications deployed to Kubernetes are automatically exposed through what is known as a [:octicons-link-external-16:`Service`](https://kubernetes.io/docs/concepts/services-networking/service/).
A service provides your application with an internal address that allows for direct communication within the [environment / cluster](../../explanations/environment.md).

The address is the name of your application:

```plaintext
http://<name>
```

If your consumers are in another namespace, the address should include the namespace as well:

```plaintext
http://<name>.<namespace>
```

**Service discovery is the recommended way to communicate between applications running in the same environment.**

Compared to [ingresses](#ingress), using service discovery has several advantages:

- _Fewer network hops and lower latency_. Requests happen directly between applications. Requests to an ingress will go out of the environment to the internet, and then back to the environment.
- _Avoids unnecessary exposure_. Applications can avoid being exposed to the outside world through an ingress if all of their consumers are internal.
- _[Access policies](../../explanations/zero-trust.md) are enforced on the network layer_. This is not the case for traffic through an ingress.

:dart: Learn how to [communicate with other workloads in the same environment](../../how-to/communication.md).

## Ingress

If your audiences consist of human users or other services outside the environment, you will have to expose your application by using an _ingress_.

An ingress exposes a route for inbound traffic from outside the environment to your application.
The domain of the URL controls which users and environments that your application is reachable from.

Your application may specify multiple ingresses, each using the same or different domains.

Ingresses may also include paths.
This allows for routing traffic to only specific parts of your application, or as part of a shared domain between multiple applications.

:dart: Learn how to [expose your application with an ingress](../how-to/expose.md).

:books: See the [ingress reference](../reference/ingress.md) for technical details and options.

## Ingress redirects

In some cases, you may want to redirect traffic from one domain to another.
This can be useful if you have changed the domain of your application, or if you want to redirect users from an old domain to a new one.

:dart: Learn how to [redirect traffic with an ingress](../how-to/redirect.md).

:books: See the [ingress reference](../reference/ingress.md#ingress-redirects) for technical details and options.