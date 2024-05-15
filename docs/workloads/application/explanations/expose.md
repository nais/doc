---
tags: [application, explanation]
---

# Exposing your application

What good is an application if no one can reach it?

NAIS tries to to make it easy to expose your application to the correct audience.
Your audience may be other applications within the same environment, or it may be humans or machines on the outside.

If your audience is other applications within the same environment, they can [communicate directly](../../how-to/communication.md) with each other provided you have defined the necessary [access policies](../../how-to/access-policies.md).
See the [zero trust](../../explanations/zero-trust.md) explanation for more information.

If you want to present your application to someone or something outside the environment, you have to expose it using an ingress.
An ingress is simply an entrypoint into your application, defined by a URL. The domain of the URL controls from where your application can be reached.
There are different domains available in each environment, see the full [list of available domains for each cluster](../../reference/environments.md).

You can have multiple ingresses for the same application, using the same or different domains.

If you only want to expose a subset of your application, or you are on a shared domain, you can specify a path for each individual ingress.

For practical instructions, see the [how-to guide for exposing an application](../how-to/expose.md).
