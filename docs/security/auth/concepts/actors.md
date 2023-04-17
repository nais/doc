# Actors

This page describes the typical actors involved in OAuth 2.0 grants and OpenID Connect flows.

## Identity Provider

An _identity provider_ (IdP) is a common service that NAV delegates to for authentication of end-users and/or services.
You might come across other terms such as _authorization server_ (AS) or _OpenID provider_ (OP). For simplicity's sake,
we'll just use the umbrella term _identity provider_.

The following is a list of the providers that the platform supports provisioning of clients for:

OpenID Connect:

- [Azure AD](../azure-ad/README.md)
- [ID-porten](../idporten/README.md)

OAuth 2.0:

- [Azure AD](../azure-ad/README.md)
- [Maskinporten](../maskinporten/README.md)
- [TokenX](../tokenx.md)

### Well-Known URL / Metadata Document

This is also referred to as the _Discovery Endpoint_ or _Metadata Document Endpoint_ or other variations with similar
names.

Every identity provider will have a metadata document that allows clients to discover the provider's capabilities and
endpoints. These are defined in
both [OpenID Connect Discovery](https://openid.net/specs/openid-connect-discovery-1_0.html#ProviderMetadata) and
[RFC 8414 - OAuth 2.0 Authorization Server Metadata](https://datatracker.ietf.org/doc/html/rfc8414).

The _well-known URL_ points to this document, which has
a [registered suffix](https://www.iana.org/assignments/well-known-uris/well-known-uris.xhtml) under the `/.well-known`
path.

An identity provider that supports both OpenID Connect and OAuth 2.0 (such as Azure AD) will usually have the URI suffix
`/openid-configuration`:

- `https://as.example.com/.well-known/openid-configuration`

A provider that only supports OAuth 2.0 (such as TokenX or Maskinporten) will use the
`/oauth-authorization-server` suffix:

- `https://as.example.com/.well-known/oauth-authorization-server`

The platform provides these URLs for you at runtime. Most libraries and frameworks support auto-discovery of other
relevant endpoints based on the properties this document. We'll take a look at the most essential properties below.

??? example "Metadata Document"

    A metadata document can look like the one shown below. Not all fields are present or required depending on whether
    the provider supports the [OAuth 2.0](https://datatracker.ietf.org/doc/html/rfc8414#section-2) or the 
    [OpenID Connect](https://openid.net/specs/openid-connect-discovery-1_0.html#ProviderMetadata) specifications.
    
    ```json
    {
      "issuer": "https://as.example.com",
      "authorization_endpoint": "https://as.example.com/authorize",
      "token_endpoint": "https://as.example.com/token",
      "end_session_endpoint": "https://as.example.com/endsession",
      "jwks_uri": "https://as.example.com/jwk",
      "response_types_supported": [
        "code",
        "id_token",
        "id_token token",
        "token"
      ],
      "response_modes_supported": [
        "query",
        "form_post",
        "fragment"
      ],
      "id_token_signing_alg_values_supported": [
        "RS256"
      ],
      "code_challenge_methods_supported": [
        "S256"
      ],
      "token_endpoint_auth_methods_supported": [
        "private_key_jwt"
      ]
    }
    ```

---

#### Issuer

The `issuer` property defines the identifier for the provider. This identifier must be a URL that uses the "https"
scheme and without query or fragment components.

Any [JWT](tokens.md#jwt) issued by the provider must contain a `iss` claim with a value that is exactly equal to the
value found in the `issuer` property of the metadata document. This should be [validated](tokens.md#token-validation)
by [OpenID Connect clients](#client) and [resource servers](#resource-server).

Additionally, the `issuer` value should be equal to the well-known URL when appending the appropriate well-known suffix.
For the examples above, the `issuer` would be `https://as.example.com`.

---

#### Token Endpoint

The `token_endpoint` property points to the endpoint where your client can request tokens from the provider
([RFC 6749, Section 3.2](https://datatracker.ietf.org/doc/html/rfc6749#section-3.2)). The provider will issue and
respond with tokens as defined in
[RFC 6749, Section 5.1](https://datatracker.ietf.org/doc/html/rfc6749#section-5.1).

Note that the tokens usually have an expiry time (often indicated by the `expires_in` field in the token response) and
are thus suitable for caching if network latency or throughput is a concern.

---

#### JWKS Endpoint (Public Keys)

The `jwks_uri` property points to the endpoint where the provider's [public JWKs](cryptography.md#public-keys) are
published. These public keys are used by your client in order to
[validate the signature](tokens.md#signature-validation) for any [JWT](tokens.md#jwt) issued by the provider.

Most clients implement a form of caching for these keys. A reasonable refresh frequency for the cache is usually
somewhere between 1 hour to 24 hours. Do note that the set of keys may change (e.g. revoking/rotating or introducing new
keys) at any time. Usually, most libraries are able to handle such cases by regularly fetching a new set of keys from
the endpoint.

In cases where a client encounters tokens that are signed with a new key, one should usually just force a refresh of the
locally cached set of keys to find the new, matching key. See also these discussions:

- <https://openid.net/specs/openid-connect-core-1_0.html#RotateSigKeys>
- <https://docs.microsoft.com/en-us/azure/active-directory/develop/active-directory-signing-key-rollover>

---

## Resource Server

A _resource server_ is any entity that requires requests to be authenticated in order to respond with meaningful data.
In other words, this is your standard bread-and-butter API server.

Resource servers should require that requests to sensitive endpoints are authenticated with
a [Bearer token](tokens.md#bearer-token). The server should [validate tokens](tokens.md#token-validation) for such
requests before accepting or rejecting the request.

---

## Client

A _client_ or _application_ is any entity or device that needs to obtain a token to access
a [resource server](#resource-server). Tokens are acquired when the client
performs [authorization grants (OAuth 2)](protocols.md#oauth-20)
or [authentication flows (OpenID Connect)](protocols.md#openid-connect).

There are two types of clients that these specifications define; _public_ and _confidential_. The primary difference
here is the notion of whether the client is capable of keeping secrets.

A public client cannot use secrets due to the nature of their runtime environment, such as directly in a browser (in a
single-page application) or on a mobile device.

A confidential client can authenticate with an identity provider using a secret or private key due to the secrets being
difficult to access to other entities than the client itself. Backend APIs, backend-for-frontends (BFFs) or standalone
daemons are typical examples of confidential clients.

Unless specified otherwise, all clients we use are confidential clients.

### Client ID

A client ID is a unique identifier associated with your client for a given identity provider. The value of the
identifier is generally not considered to be confidential. 

The client ID for your client is injected at runtime as an environment variable. 
See the respective identity provider page for details:

- [Azure AD](../azure-ad/usage.md#azure_app_client_id)
- [ID-porten](../idporten/README.md#idporten_client_id)
- [TokenX](../tokenx.md#token_x_client_id)

### Client Authentication

A confidential client must authenticate itself to the identity provider in order to
perform [grants](protocols.md#oauth-20)
or [flows](protocols.md#openid-connect).

#### Client Secret

A client secret is a password that belongs to a given client.

This is used to authenticate the client when attempting to acquire tokens from the identity provider.

Azure AD is the only identity provider we use that supports the `client_secret_post` authentication method, which is a
simple way of authenticating a client. However, the method bears the risk of exposure and interception as the secret
itself is passed in plain-text as part of the request body:

```
POST /token HTTP/1.1
Host: server.example.com
Content-Type: application/x-www-form-urlencoded

client_id=<some-client-id>
&client_secret=<some-client-secret>
&grant_type=client_credentials
```

As the platform rotates these credentials relatively regularly, using the `client_secret_post` method shouldn't pose as
a significant security risk. However, we generally do recommend that [client assertions](#client-assertion) are used
instead as they're based on [public-key cryptography](cryptography.md).

#### Client Assertion

A client assertion is a [JWT](tokens.md#jwt) that can be used to authenticate a client as defined
in [RFC 7523](https://datatracker.ietf.org/doc/html/rfc7523). Your client must create the assertion and sign it using
your client's own [private key](cryptography.md#private-keys). The JWT assertion will look something like this (in its
decoded form):

Header:

```
{
  "alg": "RS256",
  "typ": "JWT",
  "kid": "<key identifier for private key>"
}
```

Payload:

```
{
  "aud": "https://as.example.com/token",
  "iss": "<your-client-id>",
  "jti": "<some-uuid>",
  "iat": 1520589808,
  "nbf": 1520589808,
  "exp": 1520589928,
}
```

This method of authentication (also known as the `private_key_jwt` method) is supported by all
[identity providers](#identity-provider) we use. It is also mandatory for all our clients across all the providers,
except Azure AD.

An assertion has several security advantages over a [client secret](#client-secret):

- The client's private key is never exposed or sent as part of a request
- The assertion itself is usually only valid for a short duration - meaning that the blast radius is limited if the
  assertion is intercepted or stolen during transport
- The provider only needs to possess the public key (which the platform takes care of generating and registering) in order to verify
  the assertion when receiving an authenticated request from the client.

For example, for the [client credentials grant](protocols.md#client-credentials-grant):

```
POST /token HTTP/1.1
Host: as.example.com
Content-Type: application/x-www-form-urlencoded

grant_type=client_credentials
&client_id=<some-client-id>
&client_assertion=eyJhbGciOiJFUzI1NiIsImtpZCI6IjE2In0.
eyJpc3Mi[...omitted for brevity...].
J9l-ZhwP[...omitted for brevity...]
&client_assertion_type=urn:ietf:params:oauth:client-assertion-type:jwt-bearer
```

Each identity provider may have different requirements for the `grant_type` and parameter names for the assertions
(e.g. `assertion` vs `client_assertion`), so make sure to consult the documentation
for [the specific provider](#identity-provider) you're using.
