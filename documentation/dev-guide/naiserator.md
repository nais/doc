Naiserator
==========

Naiserator is the preferred way to deploy applications on the Nais platform.

Naiserator introduces a number of changes to more accurately mimic a
self-contained application platform. The most important ones are:

* *Fasit integration has been removed.* You'll need to use
  [Vault](../contracts/vault.md) to access secrets such as passwords,
  _ingresses_ to define the URLs your application can be reached at, and use
  our _built-in service discovery mechanisms_ to refer to external service
  dependencies.

* You and your team has direct access to the Kubernetes cluster, giving you
  full control over the lifecycle of your application. To reduce complexity and
  increase security, you must now deploy using the
  [kubectl](README.md#install-kubectl) command instead of an HTTP endpoint.

Please read the [migration
guide](https://github.com/nais/naiserator/blob/master/doc/migrating.md) if you are already
familiar with deployments using naisd.
