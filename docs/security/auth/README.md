---
description: Services and addons to support authentication (AuthN) & authorization (AuthZ)
---

# Authentication and Authorization

## Introduction to OAuth 2.0 / OpenID Connect

[OpenID Connect (OIDC)](concepts/protocols.md#openid-connect) and [OAuth 2.0](concepts/protocols.md#oauth-20) are the preferred specifications to provide end user authentication and ensure secure service-to-service communication for applications running on the platform.

In short, OpenID Connect is used to delegate end user authentication to a third party, while the OAuth 2.0 protocol can provide signed [tokens](concepts/tokens.md) for service-to-service communication.

See the [concepts](concepts/README.md) pages for an introduction to basic concepts and terms that are referred to throughout this documentation.

## Quickstart: How do I ...?

### 1. Sign-in or authenticate end users

This is a usually handled by a server-side component (backend-for-frontend) that performs the authentication flow and
manages the users' sessions.

#### 1.1. Citizen-facing applications

Use the [OpenID Connect Authorization Code Flow in ID-porten](idporten.md).

#### 1.2. Employee-facing applications

Use the
[OpenID Connect Authorization Code Flow in Azure AD](azure-ad/usage.md#openid-connect-authorization-code-flow).

### 2. Perform machine-to-machine requests - with end-user contexts

The application receives requests from other [clients](concepts/actors.md#client), such as backend-for-frontends or other
[resource servers](concepts/actors.md#resource-server), whom are authenticated with [Bearer tokens](concepts/tokens.md#bearer-token). These request chains are
initiated by an end user.

The application performs requests to other downstream APIs on behalf of this end user. In order to maintain
the [zero trust principles](../../appendix/zero-trust.md) we must acquire new tokens for each unique downstream API.
The new tokens should:

1. Propagate the original end user's identity
2. Be scoped to the correct downstream API with the correct [`aud` / audience claim](concepts/tokens.md#claims-validation)

#### 2.1. Citizen-facing applications

Use the [OAuth 2.0 Token Exchange Grant (TokenX)](tokenx.md).

#### 2.2. Employee-facing applications

Use the [OAuth 2.0 On-Behalf-Of Grant in Azure AD](azure-ad/usage.md#oauth-20-on-behalf-of-grant).

### 3. Perform machine-to-machine requests - without end-user contexts

The application only performs pure machine-to-machine API requests. 
It is _not_ a part of any requests chain involving any end users. 
Typical examples:

- an application that consumes a Kafka topic and performs API requests based on the Kafka record
- a daemon that performs a task periodically

#### 3.1. Internal

Use the [OAuth 2.0 Client Credentials Grant in Azure AD](azure-ad/usage.md#oauth-20-client-credentials-grant).

#### 3.2. External

Use the [OAuth 2.0 JWT Authorization Grant in Maskinporten](maskinporten/client.md#consuming-an-api).

### 4. Validate authenticated API consumers

The application receives requests from other [clients](concepts/actors.md#client)
or [resource servers / APIs](concepts/actors.md#resource-server), whom are authenticated with [Bearer tokens](concepts/tokens.md#bearer-token).

The tokens contain information about the application that performed the request. The tokens will also contain 
information about the original end user, if any.

[Validate the tokens](concepts/tokens.md#token-validation) before granting access to the API resource.
