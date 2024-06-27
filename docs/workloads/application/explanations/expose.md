---
tags: [application, explanation, ingress, service-discovery]
---

# Exposing your application

What good is an application if no one can reach it?

NAIS tries to make it easy to expose your application to the correct audience.
Your audience may be other applications within the same [environment](../../explanations/environment.md), or it may be humans or machines on the outside.

## Service discovery

If your audience is other applications within the same environment, they can communicate with your application directly by using [service discovery](../../explanations/service-discovery.md).

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
