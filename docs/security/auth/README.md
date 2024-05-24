---
tags: [auth, explanation]
description: Services and addons to support authentication (AuthN) & authorization (AuthZ)
---

# Authentication and Authorization

[OpenID Connect (OIDC)](../../auth/explanations/README.md#openid-connect) and [OAuth 2.0](../../auth/explanations/README.md#oauth-20) are the preferred specifications to provide end user authentication and ensure secure service-to-service communication for applications running on the platform.

In short, OpenID Connect is used to delegate end user authentication to a third party, while the OAuth 2.0 protocol can provide signed [tokens](../../auth/explanations/README.md#tokens) for service-to-service communication.

See the [concepts](../../auth/explanations/README.md) pages for an introduction to basic concepts and terms that are referred to throughout this documentation.

## How do I sign in or authenticate end users?

This is a usually handled by a server-side component (backend-for-frontend) that performs the authentication flow and manages the users' sessions.

**Citizen-facing applications**

Use the [OpenID Connect Authorization Code Flow in ID-porten](../../auth/idporten/README.md).

**Employee-facing applications**

Use the [OpenID Connect Authorization Code Flow in Entra ID](../../auth/entra-id/how-to/login.md).

---

## How do I perform requests on behalf of end-users?

The application receives requests from other [clients](../../auth/explanations/README.md#client), authenticated with [Bearer tokens](../../auth/explanations/README.md#bearer-token).
An end user initiates these request chains.

The application performs requests to other downstream APIs on behalf of this end user.
We must acquire new tokens for each unique downstream API that we need to access.

The new tokens should:

1. Propagate the original end user's identity
2. Be scoped to the correct downstream API with the correct [`aud` / audience claim](../../auth/explanations/README.md#claims-validation)

**Citizen-facing applications**

Use the [OAuth 2.0 Token Exchange Grant (TokenX)](../../auth/tokenx/README.md).
 
**Employee-facing applications**

Use the [OAuth 2.0 On-Behalf-Of Grant in Entra ID](../../auth/entra-id/how-to/consume-obo.md).

---

## How do I perform machine-to-machine requests?

The application only performs pure machine-to-machine API requests. 
It is _not_ a part of any request chain involving any end users.

Typical examples:

- an application that consumes a Kafka topic and performs API requests based on the Kafka record
- a daemon that performs a task periodically

**Internal**

Use the [OAuth 2.0 Client Credentials Grant in Entra ID](../../auth/entra-id/how-to/consume-m2m.md).

**External**

Use the [OAuth 2.0 JWT Authorization Grant in Maskinporten](../../auth/maskinporten/README.md).

---

## How do I validate tokens?

The application receives requests from other clients, authenticated with [Bearer tokens](../../auth/explanations/README.md#bearer-token).

The tokens contain information about the application that performed the request. The tokens will also contain 
information about the original end user, if any.

[Validate the tokens](../../auth/explanations/README.md#token-validation) before granting access to the API resource.
