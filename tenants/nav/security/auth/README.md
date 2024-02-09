---
description: Services and addons to support authentication (AuthN) & authorization (AuthZ)
---

# Authentication and Authorization

[OpenID Connect (OIDC)](concepts.md#openid-connect) and [OAuth 2.0](concepts.md#oauth-20) are the preferred specifications to provide end user authentication and ensure secure service-to-service communication for applications running on the platform.

In short, OpenID Connect is used to delegate end user authentication to a third party, while the OAuth 2.0 protocol can provide signed [tokens](concepts.md#tokens) for service-to-service communication.

See the [concepts](concepts.md) pages for an introduction to basic concepts and terms that are referred to throughout this documentation.

## Quickstart: How do I ...?

### 1. How do I sign in or authenticate end users?

This is a usually handled by a server-side component (backend-for-frontend) that performs the authentication flow and manages the users' sessions.

#### 1.1. Citizen-facing applications

Use the [OpenID Connect Authorization Code Flow in ID-porten](idporten.md).

#### 1.2. Employee-facing applications

Use the [OpenID Connect Authorization Code Flow in Azure AD](azure-ad/usage.md#openid-connect-authorization-code-flow).

### 2. How do I perform requests on behalf of end-users?

The application receives requests from other [clients](concepts.md#client), authenticated with [Bearer tokens](concepts.md#bearer-token).
An end user initiates these request chains.

The application performs requests to other downstream APIs on behalf of this end user.
We must acquire new tokens for each unique downstream API that we need to access.

The new tokens should:

1. Propagate the original end user's identity
2. Be scoped to the correct downstream API with the correct [`aud` / audience claim](concepts.md#claims-validation)

#### 2.1. Citizen-facing applications

Use the [OAuth 2.0 Token Exchange Grant (TokenX)](tokenx.md).

#### 2.2. Employee-facing applications

Use the [OAuth 2.0 On-Behalf-Of Grant in Azure AD](azure-ad/usage.md#oauth-20-on-behalf-of-grant).

### 3. How do I perform machine-to-machine requests?

The application only performs pure machine-to-machine API requests. 
It is _not_ a part of any request chain involving any end users.

Typical examples:

- an application that consumes a Kafka topic and performs API requests based on the Kafka record
- a daemon that performs a task periodically

#### 3.1. Internal

Use the [OAuth 2.0 Client Credentials Grant in Azure AD](azure-ad/usage.md#oauth-20-client-credentials-grant).

#### 3.2. External

Use the [OAuth 2.0 JWT Authorization Grant in Maskinporten](maskinporten/client.md).

### 4. How do I validate tokens?

The application receives requests from other clients, authenticated with [Bearer tokens](concepts.md#bearer-token).

The tokens contain information about the application that performed the request. The tokens will also contain 
information about the original end user, if any.

[Validate the tokens](concepts#token-validation) before granting access to the API resource.
