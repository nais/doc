# Protocols

## OAuth 2.0

[OAuth 2.0](https://oauth.net/2/) is an industry-standard protocol for authorization. In NAV, we use this protocol in
order to acquire
[security tokens](tokens.md) that can be used to secure and assert requests between applications.

The framework is extensible and has a [number of associated specifications](https://oauth.net/specs/). We will however 
attempt to only describe the parts relevant to us.

In order to obtain an [access token](tokens.md#access-token), we need an _authorization grant_. The grant represents a
delegated authorization. The client is granted authorization by a resource owner (such as an end user or the client
itself) to access protected resources that belong to the owner.

There are multiple ways of obtaining such a grant, depending on the context of the actual use case. We'll go through the
relevant ones below.

### Client Credentials Grant

The client acts on its own behalf where it is also the resource owner. That is, the client owns the requested resources
or has otherwise been granted access to them.

This grant is used
for [internal machine-to-machine requests without end users](../README.md#3-my-application-performs-machine-to-machine-requests-without-any-end-user-context)
with [Azure AD](../azure-ad/usage.md#oauth-20-client-credentials-grant).

Detailed specifications in [RFC 6749, Section 4.4](https://datatracker.ietf.org/doc/html/rfc6749#section-4.4).

### JWT Authorization Grant

This grant is similar to the client credentials grant, however uses a JWT assertion to acquire the grant instead of
explicitly [authenticating itself](actors.md#client-authentication).

This grant is used for [external machine-to-machine requests without end users](../README.md#32-external)
with [Maskinporten](../maskinporten/client.md).

Detailed specifications in [RFC 7523, Section 2.1](https://datatracker.ietf.org/doc/html/rfc7523#section-2.1).

### Token Exchange Grant

This grant allows a client to act on behalf of another principal, typically an end user - this is also known as
delegation. In short, the grant involves exchanging the principal's token received in the request for a new token that
grants access to another backend/downstream resource while still preserving the end user context.

This grant is used
for [machine-to-machine requests with end user context](../README.md#2-my-application-performs-machine-to-machine-requests-with-an-end-user-context)
using [TokenX](../tokenx.md).

Detailed specifications in [RFC 8693](https://datatracker.ietf.org/doc/html/rfc8693/).

### On-Behalf-Of Grant

This grant is Microsoft's implementation of the [Token Exchange Grant](#token-exchange-grant). As it was implemented
before the RFC for the Token Exchange Grant was finalized, there are some minor differences in parameter names and 
values - however the main concepts remain the same.

This grant is used
for [machine-to-machine requests with end user context](../README.md#2-my-application-performs-machine-to-machine-requests-with-an-end-user-context)
using [Azure AD](../azure-ad/usage.md#oauth-20-on-behalf-of-grant).

---

## OpenID Connect

[OpenID Connect (OIDC)](https://openid.net/connect/) is a simple identity layer on top of the OAuth 2.0 protocol. This
allows for clients and applications to verify the identity and make assertions about an end user that has authenticated
themselves with a trusted authorization server.

The [OpenID Connect Core 1.0](https://openid.net/specs/openid-connect-core-1_0.html) specifications define a number of
authentication flows. As best practice, we recommend the use of the [Authorization Code Flow](#authorization-code-flow),
especially together with the [OAuth 2.0 - Proof Key for Code Exchange (PKCE)](https://oauth.net/2/pkce/) extension.

### Authorization Code Flow

The [Authorization Code Flow](https://openid.net/specs/openid-connect-core-1_0.html#CodeFlowAuth) involves the following
steps:

1. Client prepares an Authentication Request containing the desired request parameters.
2. Client sends the request to the Authorization Server.
3. Authorization Server Authenticates the End-User.
4. Authorization Server obtains End-User Consent/Authorization.
5. Authorization Server sends the End-User back to the Client with an Authorization Code.
6. Client requests a response using the Authorization Code at the Token Endpoint.
7. Client receives a response that contains an ID Token and Access Token in the response body.
8. Client validates the ID token and retrieves the End-User's Subject Identifier.

The client is usually implemented in a backend-for-frontend, which means the flow and session management is handled
server-side.

This flow is supported by the following identity providers:

- [Azure AD](../azure-ad/usage.md#openid-connect-authorization-code-flow) (employee-facing applications)
- [ID-porten](../idporten.md) (citizen-facing applications)

The platform provides opt-in sidecars that implement such clients:

- [Sidecar for Azure AD](../azure-ad/sidecar.md) (employee-facing applications)
- [Sidecar for ID-porten](../idporten.md) (citizen-facing applications)

Due to the complexity involved in implementing and maintaining such clients, we recommend that your applications use 
these sidecars when possible. 

---

## Further Reading

- <https://nais.io/blog/posts/2020/09/oauth1>
- <https://nais.io/blog/posts/2020/09/oauth2>
- <https://nais.io/blog/posts/2021/03/oauth-del-3-pkce>
- <https://oauth.net/2/>
- <https://oauth.net/2.1/>
- <https://openid.net/connect/>
- <https://connect2id.com/learn/oauth-2>
- <https://infosec.mozilla.org/guidelines/iam/openid_connect.html>
- <https://pragmaticwebsecurity.com/files/cheatsheets/oauth2securityfordevelopers.pdf>
