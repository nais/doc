# Exposing your application

What good is an application if no one can reach it?

NAIS tries to to make it easy to expose your application to the correct audience.
Your audience may be other applications within the same environment, or it may be humans or machines on the outside.

If your audience is other applications within the same environment, they can [communicate directly](../how-to-guides/communicating-inside-environment.md) with each other provided you have defined the necessary [access policies](../how-to-guides/access-policies.md). See the [zero trust](./zero-trust.md) explanation for more information.

If you want to present your application to someone or something outside the environment, you have to expose it using an ingress.
An ingress is simply an entrypoint into your application, defined by a URL. The domain of the URL controls from where your application can be reached.
There are different domains available in each environment, see the full [list of available domains for each cluster](../reference/environments.md).

E.g. if your environment has the following domains: `internal.acme.com` for exposing workloads to acme's internal networks, and `acme.com` for the internet.
If you want to expose your application to the outside world, you would use the `acme.com` domain by [defining the ingress](../reference/application-spec.md#ingresses) `myapp.acme.com` in your application manifest. Once the manifest is deployed, NAIS would make your application available on https://myapp.acme.com.
