---
tags: [explanation, auth, workload-identity]
---

# Workload Identity

All workloads on Nais have their own _identities_.
In practice, this is a [Kubernetes Service Account](https://kubernetes.io/docs/concepts/security/service-accounts/).

Workloads on Nais are automatically injected with a short-lived OpenID Connect (OIDC) identity token.

## Workload Identity Federation

_Workload identity federation_ establishes a trust relationship between the workload's identity and a third-party service.

This allows your workloads to authenticate with third-party services without the need to manage long-lived credentials, such as API keys or service account keys.

## OpenID Connect Metadata

To set up workload identity federation with a third-party service, you need to provide relevant metadata for a given [environment](../workloads/reference/environments.md).
The metadata is found in the [OIDC Discovery Document](explanations/README.md#well-known-url-metadata-document), which is unique per environment.

Use the [Nais CLI](https://cli.nais.io/) to retrieve the OIDC discovery document for your environment:

```shell
nais auth workload-identity-metadata --environment $NAIS_ENVIRONMENT
```

You usually need to provide the following metadata to the third-party service:

| Metadata               | Value                                                | Description                                                                         |
|:-----------------------|:-----------------------------------------------------|:------------------------------------------------------------------------------------|
| `issuer`               | From the discovery document                          | The authority that issues the identity tokens.                                      |
| `jwks_uri`             | From the discovery document                          | The URL where the public keys for verifying the identity tokens can be retrieved.   |
| `aud` (audience claim) | Always `nais`                                        | The expected audience claim in the identity tokens.                                 |
| `sub` (subject claim)  | `system:serviceaccount:<team>:<name-of-workload>`    | The expected subject claim in the identity tokens, usually the workload's identity. |

## Using the Workload Identity Token

The token is automatically injected into your workload's runtime as a file.
The path to the file is provided in the environment variable `NAIS_SERVICE_ACCOUNT_TOKEN_PATH`.

Always re-read the token from file before using it. The token is periodically rotated and the file is updated in-place.
