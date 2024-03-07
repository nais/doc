# Secrets

A secret is a piece of sensitive information that is used in a [workload](workloads/README.md).
This can be a password, an API key, or any other information that should not be exposed to the public.

Secrets are kept separate from the codebase and configuration files that are usually stored in version control.

There are two types of secrets on the NAIS platform:

<div class="grid cards" markdown>
-   :construction_worker: **Platform-provided secrets**

    ---
    _Platform-provided secrets_ are provisioned and managed by the platform.

    - These typically contain credentials used for integrating with services that NAIS supports, such as databases, Kafka and so on.
    - You will generally not deal with these secrets as their values are automatically made available to your workloads at runtime.
</div>

<div class="grid cards" markdown>
- :technologist: **User-defined secrets**

    ---
    _User-defined secrets_ are managed by you and your [team](team.md).

    - These are typically used for integrating with third-party services or APIs that are not provided by NAIS, such as Slack or GitHub.
    - User-defined secrets can also be used to store sensitive information specific to your application, such as encryption keys or other private configuration.
</div>

## What's next?

- :dart: Learn how to [create and manage a secret in Console](../how-to-guides/secrets/console.md)
- :dart: Learn how to [use a secret in your workloads](../how-to-guides/secrets/workloads.md)

:clipboard: See also the [reference](../reference/secrets.md) for more technical details
