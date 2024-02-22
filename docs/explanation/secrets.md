# Secrets

A secret is a piece of sensitive information that is used in a [workload](workloads/README.md).
This can be a password, an API key, or any other information that should not be exposed to the public.

Secrets are kept separate from the codebase and configuration files that are usually stored in version control.

There are two types of secrets on the NAIS platform:

- **Platform-provided secrets** are provisioned and managed by the platform.

    These typically contain credentials used for integrating with services that NAIS supports, such as databases, Kafka and so on.

    You will generally not deal with these secrets as their values are automatically made available to your workloads at runtime.

- **User-defined secrets** are managed by you and your [team](team.md).

    These are typically used for integrating with third-party services or APIs that are not provided by NAIS, such as Slack or GitHub.

    User-defined secrets can also be used to store sensitive information specific to your application, such as encryption keys or other private configuration.

## What's next?

- Create a secret and use it in your workload in the [how-to guide](../how-to-guides/secrets.md)
- Find more technical information on the [reference page](../reference/secrets.md)
