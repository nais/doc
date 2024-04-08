# Exposing your application

What good is an application if no one can reach it?

NAIS tries to to make it easy to expose your application to the correct audience.
Your audience may be other applications within the same environment, or it may be humans or machines on the outside.

If your audience is other applications within the same environment, they can [communicate directly](../how-to-guides/communicating-inside-environment.md) with each other provided you have defined the necessary [access policies](../how-to-guides/access-policies.md). See the [zero trust](./zero-trust.md) explanation for more information.

If you want to present your application to someone or something outside the environment, you have to expose it using an ingress.
An ingress is simply an entrypoint into your application, defined by a URL. The domain of the URL controls from where your application can be reached.
There are different domains available in each environment, see the full [list of available domains for each cluster](../reference/environments.md).

For practical instructions, see the [how-to guide for exposing an application](../how-to-guides/exposing-an-application.md).
