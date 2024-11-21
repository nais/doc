---
tags: [auth, explanation]
---

# Auth concepts

{%- if tenant() == "nav" %}

This page describes basic concepts and glossary commonly referred to when working with authentication and authorization.

Most of the documentation later on assumes that you are familiar with these concepts,
so come back when you stumble upon something you're unfamiliar with.

---

## Protocols

### OAuth 2.0

[OAuth 2.0](https://oauth.net/2/) is an industry-standard protocol for authorization.

In NAV, the protocol is used to acquire [security tokens](#tokens) for use in authenticated requests between applications.

To obtain an [access token](#access-token), we need an _authorization grant_.
The grant represents a delegated authorization.
The client application is granted authorization by a resource owner (such as an end user or the client itself)
to access protected resources that belong to the owner.

There are multiple ways of obtaining such a grant, depending on the use case:

**Internal applications**

- [Machine-to-machine with Entra ID](../entra-id/how-to/consume-m2m.md)

**Employee-facing applications**

- [On-behalf-of an end-user with Entra ID](../entra-id/how-to/consume-obo.md)

**External applications**

- [Machine-to-machine with Maskinporten](../maskinporten/README.md)

**Citizen-facing applications**

- [On-behalf-of an end-user with TokenX](../tokenx/README.md)

### OpenID Connect

[OpenID Connect (OIDC)](https://openid.net/connect/) is an identity layer on top of the OAuth 2.0 protocol.
It is used to authenticate end users.

The platform provides opt-in [login proxies](#login-proxy) that implement OpenID Connect:

- [Login proxy for Entra ID](../entra-id/how-to/login.md) (employee-facing applications)
- [Login proxy for ID-porten](../idporten/how-to/login.md) (citizen-facing applications)

Due to the complexity involved in implementing and maintaining such clients, we recommend that your applications use
these proxies when possible.

If you do implement your own client, we recommend that you always use the
[Authorization Code Flow](https://openid.net/specs/openid-connect-core-1_0.html#CodeFlowAuth) together with
the [OAuth 2.0 - Proof Key for Code Exchange (PKCE)](https://oauth.net/2/pkce/) extension.

---

## Actors

Typical actors involved in OAuth 2.0 grants and OpenID Connect flows.

### Identity Provider

An _identity provider_ (IdP) is a common service that NAV delegates to for authentication of end-users and/or services.
Similar terms such as _authorization server_ (AS) or _OpenID provider_ (OP) are used interchangeably with IdP.

Providers that the platform supports provisioning for:

- [Entra ID](../entra-id/README.md)
- [ID-porten](../idporten/README.md)
- [Maskinporten](../maskinporten/README.md)
- [TokenX](../tokenx/README.md)

#### Well-Known URL / Metadata Document

Every identity provider will have a metadata document that allows clients to discover the provider's capabilities and
endpoints.

This is also referred to as the _Discovery Endpoint_ or _Metadata Document Endpoint_ or other variations with similar
names.

The _well-known URL_ points to this document, which has a registered suffix under the `/.well-known` path.
For example:

- `https://as.example.com/.well-known/openid-configuration`
- `https://as.example.com/.well-known/oauth-authorization-server`

The platform provides these URLs for you at runtime.

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

#### Issuer

The `issuer` property defines the identifier for the provider.
This identifier must be a URL that uses the "https"
scheme and without query or fragment components.

Any [JWT](#jwt) issued by the provider must contain a `iss` claim with a value that is exactly equal to the
value found in the `issuer` property of the metadata document.
This should be [validated](#token-validation) by [OpenID Connect clients](#client) and [resource servers](#resource-server).

Additionally, the `issuer` value should be equal to the well-known URL when appending the appropriate well-known suffix.
For the examples above, the `issuer` would be `https://as.example.com`.

#### Token Endpoint

The `token_endpoint` property points to the endpoint where your client can request tokens from the provider.
The provider will issue and respond with tokens as defined in [RFC 6749, Section 5.1](https://datatracker.ietf.org/doc/html/rfc6749#section-5.1).

Tokens have a set expiration time, indicated by the `expires_in` field in the token response.
The tokens returned are thus suitable for caching and re-use within this period.

#### JWKS Endpoint (Public Keys)

The `jwks_uri` property points to the endpoint where the provider's [public JWKs](#public-keys) are published.
Your client uses these public keys to [validate the signature](#signature-validation) for any [JWT](#jwt) issued by the provider.

Most clients implement a form of caching for these keys.
A reasonable refresh frequency for the cache is usually somewhere between 1 hour to 24 hours.

Do note that the set of keys may change at any time, e.g. during revocation or rotation of keys.
Most libraries usually handle changes to these keys transparently for you.

### Resource Server

A _resource server_ is any entity that requires requests to be authenticated before responding with meaningful data.
In other words, this is your standard bread-and-butter API server.

Resource servers should require that requests to sensitive endpoints are authenticated with
a [Bearer token](#bearer-token). The server should [validate tokens](#token-validation) for such
requests before accepting or rejecting the request.

### Client

A _client_ or _application_ is any entity or device that needs to get a token to access a [resource server](#resource-server).
The client acquires tokens as a part of the [OAuth 2.0 grants](#oauth-20) or [OpenID Connect flows](#openid-connect).
Clients may either be _public_ and _confidential_. The primary difference here is the notion of whether the client is capable of keeping secrets.

A _public_ client cannot use secrets due to the nature of their runtime environment, such as directly in a browser (in a
single-page application) or on a mobile device.

A _confidential_ client can authenticate with an identity provider using a secret or private key due to the secrets being
difficult to access to other entities than the client itself. Backend APIs, backend-for-frontends (BFFs) or standalone
daemons are typical examples of confidential clients.

Unless specified otherwise, all clients we use are confidential clients.

#### Client ID

A client ID is a unique identifier associated with your client for a given identity provider. The value of the
identifier is generally not considered to be confidential.

The client ID for your client is injected at runtime as an environment variable.
See the respective identity provider page for details:

- [Entra ID](../entra-id/reference/README.md#runtime-variables-credentials)
- [ID-porten](../idporten/reference/README.md#runtime-variables-credentials)
- [Maskinporten](../maskinporten/reference/README.md#runtime-variables-credentials)
- [TokenX](../tokenx/reference/README.md#runtime-variables-credentials)

#### Client Authentication

A confidential client must authenticate itself to the identity provider.

##### Client Secret

A client secret is a password that belongs to a given client.

This is used to authenticate the client when attempting to acquire tokens from the identity provider.

Entra ID is the only identity provider we use that supports the `client_secret_post` authentication method.
The secret itself is passed in plain-text as part of the request body:

```http title="Token request"
POST /token HTTP/1.1
Host: server.example.com
Content-Type: application/x-www-form-urlencoded

client_id=<some-client-id>&
client_secret=<some-client-secret>&
grant_type=client_credentials
```

As the platform rotates these credentials relatively regularly, using the `client_secret_post` method shouldn't pose as
a significant security risk.

##### Client Assertion

A client assertion is a [JWT](#jwt) that can be used to authenticate a client.
Your client must create the assertion and sign it using a [private key](#private-keys) associated with the client.
The JWT assertion will look something like this (in its decoded form):

Header:

```json
{
  "alg": "RS256",
  "typ": "JWT",
  "kid": "<key identifier for private key>"
}
```

Payload:

```json
{
  "aud": "https://as.example.com/token",
  "iss": "<your-client-id>",
  "jti": "<some-uuid>",
  "iat": 1520589808,
  "nbf": 1520589808,
  "exp": 1520589928
}
```

This method of authentication (also known as the `private_key_jwt` method) is supported by all
[identity providers](#identity-provider) we use.
It is also mandatory for all our clients across all the providers, except Entra ID.

An assertion has several security advantages over a [client secret](#client-secret):

- The client's private key is never exposed or sent as part of a request
- The assertion itself is usually only valid for a short duration - meaning that the blast radius is limited if the
  assertion is intercepted or stolen during transport
- The provider only needs knowledge of the public key to verify the assertion when receiving an authenticated request from the client.
  The platform takes care of generating and registering the public key.

For example, for the client credentials grant:

```http title="Token request"
POST /token HTTP/1.1
Host: as.example.com
Content-Type: application/x-www-form-urlencoded

grant_type=client_credentials&
client_id=<some-client-id>&
client_assertion=eyJhbGciOiJFUzI1NiIsImtpZCI6IjE2In0.eyJ[...].J9l[...]&
client_assertion_type=urn:ietf:params:oauth:client-assertion-type:jwt-bearer
```

Each identity provider may have different requirements for the `grant_type` and parameter names for the assertions
(e.g. `assertion` vs `client_assertion`), so make sure to consult the documentation
for [the specific provider](#identity-provider) you're using.

---

## Tokens

A _token_ is a piece of data that contains information about an authenticated entity.
The receiver of a token can assert claims about the entity that the request is performed on behalf of.

An advantage of using a token is that a user never has to directly present their private credentials or passwords to
the resource server.
This is delegated to the identity provider who in turn issues tokens for said user.
Additionally, a token often has an expiry time to limit its use.

A token is usually in the form of a self-contained [JWT](#jwt), but can have other formats.
All JWTs are tokens, but not all tokens are JWTs.

### Bearer Token

A token is generally used as a [_Bearer_ token](https://datatracker.ietf.org/doc/html/rfc6750). Most resource servers
in NAV will require that you supply the bearer token in the `Authorization` header, as specified
in [RFC 6750, section 2.1](https://datatracker.ietf.org/doc/html/rfc6750#section-2.1):

```
GET /resource HTTP/1.1

Host: as.example.com
Authorization: Bearer eyJhbGciOiJFUzI1NiIsImtpZCI6IjE2In0...
```

### JWT

JSON Web Token (JWT) is a compact, self-contained means of representing claims as a JSON object to be transferred
between two parties, as specified in [RFC 7519](https://tools.ietf.org/html/rfc7519).

The contained claims can be verified and trusted by validating its digital signature.

In most cases, the JWT is signed using an [asymmetric secret](#cryptography), i.e. public and private key pair:

1. The sending party will sign the JWT using their private key.
2. The receiving party may verify the signature using the signer's associated public key, which may be distributed
   out-of-band or [published at a well-known endpoint](#jwks-endpoint-public-keys).

A JWT will look something like this in its serialized, compact form (where each part is base64-URL-encoded):

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
```

The token consists of three parts:

```
<header>.<payload>.<signature>
```

#### Header

The _header_ consists of metadata describing the token, such as:

* `kid`: The key ID of the associated key used to sign the token.
* `typ`: The type of token, usually `JWT`.
* `alg`: The algorithm used to sign the token, usually `RS256`.

Example:

```json
{
  "alg": "RS256",
  "typ": "JWT",
  "kid": "<some-key-id>"
}
```

#### Payload

The payload contains _claims_ about the associated user or principal that the token represents as well as additional
data.

JWTs will mostly consist of [registered claims](https://datatracker.ietf.org/doc/html/rfc7519#section-4.1) or "standard"
claims.
Depending on the identity provider however, additional claims may be included.

Example (with registered claims only):

```json
{
  "iss": "https://as.example.com",
  "sub": "f6V1gB18pwpV06nWjbPLMxdjZiefEnl7G5oNih6LDUI=",
  "aud": "302fc528-9d76-481a-bd4f-92a540d738c8",
  "nbf": 1648645430,
  "iat": 1648645430,
  "exp": 1648649030,
  "jti": "W1bYOUA0WT1rEYUjE2YfXge0cfVSgiE5sSwIMM4tSSA"
}
```

See [RFC 7519, section 4.1](https://datatracker.ietf.org/doc/html/rfc7519#section-4.1) for descriptions of these claims.

Parties receiving JWTs should validate the claims found in the payload. See [token validation](#token-validation).

#### Signature

A JWT should always be signed by its [_issuer_](#issuer) using their _private key_.

Recipients of the JWT can use the signature to verify the integrity of the information contained within the token.
The issuer's _public key_ is used to verify the signature.
Successful verification implies that the token nor its contents has been tampered with or modified at any point after being issued.

The signature is generated by encoding the header and payload, generating a hash of the encoded data, and then signing the hash using the issuer's private key.

### ID Token

An _ID token_ is only included as part of the OpenID Connect standard and is always a [JWT](#jwt).
The ID token is strictly used for _authentication_ of end-users.

It should not be used to grant access to any [resource servers](#resource-server).
The correct token to use in such cases is an [_access token_](#access-token).

The ID token only asserts that a user has been logged in at the identity provider and authenticated.
The token's intended recipient is the client application that initiated the login.

### Access Token

An _access token_ is a token that allows the client application to perform authenticated requests on behalf of the
end-user. In OAuth 2.0 terms, this is what is known as _delegated authorization_.

The token should be used when performing requests to a [resource server](#resource-server), and the resource
server should [validate the token](#token-validation).

Access tokens are usually in the form of [JWTs](#jwt), which allows for local validation without the need for network calls.

### Token Validation

There are two distinct cases where your client should perform token validation:

1. Your application is a [resource server](#resource-server) or API that receives authenticated requests from
   consumers.
2. Your application performs the [OpenID Connect Authorization Code Flow](#openid-connect).

Validation should always be performed before granting access to any [resource server](#resource-server).

Use well-known and widely used libraries and frameworks that take care of most
of the heavy lifting for you.

See [libraries and frameworks](../reference/README.md#libraries-and-frameworks-for-validating-and-acquiring-tokens) for a non-comprehensive list.

#### Signature Validation

A JWT usually contains the `kid` (key ID) claim in the token's [header](#header) to indicate which key was used to sign
the token.
The signature can then be verified by finding the matching [public key](#public-keys) from the
provider's [`jwks_uri` endpoint](#jwks-endpoint-public-keys).

The algorithm used to sign a JWT is indicated by the `alg` claim in the token's [header](#header).
For our providers, the algorithm value should be `RS256`.
If the algorithm is set to `none` or the JWT is not signed, the request should be rejected.

#### Claims Validation

Generally speaking, the most important JWT claims to validate are the following:

- `iss` (**issuer**)
    - The issuer of the token. This should be exactly equal to the [issuer](#issuer) property declared by the
      provider's [metadata document](#well-known-url-metadata-document)
- `aud` (**audience**)
    - The expected recipient of the token.
    - The value of this is usually a unique identifier such as a [client ID](#client-id) that belongs to either
      the [client](#client) or [resource server](#resource-server) that the token is intended for.
- `exp` (**expiration time**)
    - The timestamp for which the token expires, in unix time (seconds since epoch). The token is invalid if it is used
      after this time.
- `iat` (**issued at time**)
    - The timestamp for which the token was issued, in unix time (seconds since epoch). This can be used to determine
      the age of the token.
- `nbf` (**not before time**)
    - The timestamp for which the token is considered valid, in unix time (seconds since epoch). The token is invalid if
      it is used before this time.
    - This is an optional claim and not always included depending on the provider, but should be validated if present.

If any of the above claims are missing or contain unexpected values, validation should fail and the token should be
rejected.
Most libraries will have implementations to automatically validate these de facto standard claims.

See the individual identity provider pages for specific validation related to each provider:

- [Entra ID](../entra-id/how-to/secure.md#validate-tokens)
- [ID-porten](../idporten/how-to/login.md#validate-token-in-authorization-header)
- [Maskinporten](../maskinporten/how-to/secure.md#validate-tokens)
- [TokenX](../tokenx/how-to/secure.md#validate-tokens)

---

## Cryptography

[Tokens](#tokens) are often [signed](#signature) using public-key cryptography, or asymmetric cryptography.
This usually involves having a pair of private and public keys.

One party keeps the private key secret, while the associated public key can be freely distributed to
other parties.
This public key can be used to verify that any data signed with the private key indeed was
signed by a party that possesses the private key.

### JWK

A [JSON Web Key](https://datatracker.ietf.org/doc/html/rfc7517) (JWK) is a cryptographic key represented as a JSON
object.

A [JWKS](https://datatracker.ietf.org/doc/html/rfc7517#section-5) (JWK Set) is a closely related term. It is a set of
keys that may contain multiple JWKs.

### Private Keys

If your application integrates with one of the [identity providers](#identity-provider) in use at NAV, you will
have a unique _private key_ for each combination of (client, identity provider).

The private key should be, as its name implies, _private_. It is considered to be a secret in line with passwords and
other sensitive keys. It should _never_ be exposed to the browser, an end-user, or committed to version control.

This private key is primarily meant to be used in [client assertions](#client-assertion) where your client
authenticates itself with a JWT that is signed with said key.

??? example "Private JWK (click to expand)"

    ```json
      {
         "p": "2dZeNRmZow7uWKzqpOolNf7FUIr6dP5bThwnqpcDca7sP96fzPGaryZmYAawZj7h1UthpDp9b2D5v0-D0fSrbdp-MisaOz_ZL-2kdwyTSIP0ii-4yPHpFqaZuGTbuLmROwDhklTGMoYC4fN8vb0jgE6cR33bA52JH255qz5R1rc",
         "kty": "RSA",
         "q": "pIt7sgMqDPGZDMiksZ19R9iuUZk5ZcsnPeI0yAGIaEp75Nc7IH9F1LQ8mPw-wtV3Yde26mByszjeskVfldlReZmzeCTXq4jgu5WEi2GM7craTZj-ES7SLkuP21uvbgxGCLxEizr4RCdZD8TtkxcSG2-GPkp-N4IX9187kvWbWl8",
         "d": "R_P82iKNJflwkPnpOr5eGmtekLvTq1cZwJ7M0vbox3LlVmpIP9iRPKVEwuBva0ybRu1pkvM4S3DFgYK6gKjHVzPYl6lHvKZxbFyP8lJoaj1km2NhA3cwqJjqkx4VAJhLlEuG5wDlTSRXNpzqfamdZcH-XMG2rM-nh6yFqbSzyaeO99ZnGMDp5mZvzGuR0VmV6IXPXqelP4uT9cPQD60h1v2DaOKlmd-0ghGfdHa0hzR5S8C55oZ5hF1_bhgx6tA8VzC1jp41mDbKmKAOKvcFG2T9JQRBml2izRVVaCsVN0_ZCR7NhQYrkreqgVN_ZLlgzI6YSA2EN1FWmc9GvNFAbQ",
         "e": "AQAB",
         "use": "sig",
         "kid": "ut-Fle8JH9IdPqo7QDDakblWR1DdvMIijJT9A-lVntk",
         "qi": "uoncSFVC9_vS652rNSZQO8I7KCk0b2bpt38Sb1iQ8Vha5lYkrTp-AsZLoduj7TscCCqlftm9R-FkfERjEYZLdPKQIaGcCQ-L0RzIG_K3w48Tk2T_EEiMqds4UeBpQxccMjUvX-t_b7pwMjFL1RIEBSWAxg5YShT8C83hv0llh9Y",
         "dp": "BLMxWSfyPqhl0Bf7AA_lOaMDktdMzBVo1uiYmn-jnWJOypn9DKjx03Gap9u9Fpeou7dipe51ImAPQ2dtyqvivv4F1wNDD6AzCWuxLrhgvSHLtueMrxk5FDoH-wiCDRxD2-gK9eNKW3C0wzdDq7xW9b-8c3ZtsUhG2xzBF0bC8UU",
         "alg": "RS256",
         "dq": "R_ji4BhWOlcq9NaGg1I5zEVQ6kw1OPtFbOIW6C0Td1qtGomySSKibslvgBNFeH9auqdaUOZjBVWowx1pE-h8pM3AHJsw4sz6T9K0qSrAM_r4xdxXtThfovRWNkLCV0ZzE7sV2DixA06avDUNHbuHpgyAEZsP3kO_K-qx6jQYAc0",
         "n": "jAQFAKQ9omNtb_I2iSryCulJnkB56qGf35fA1RrDBLup7ysJCez9dnu-HTZ62SKoe-9Pxu-4WzjjBNQacotUXYTIi7GFWM5Pyb4ha-bBJprbiwhyrYGIVzZw4LIcleexWPcIOI0cTKmpM6qKb9_6CTFa-A6uX_16n-n3fQjWGPKrJBY7mcIalJ4YTmLhavs6yt6efSD67SaJ2FabzjouRa_yeDmsGPq2LA-4FymDvuGCHeeMtPO9ClnA2eWC15L7n3-Pagm5pso5GchORl2Rwr_bhCmNCKsC_Qh6TqTHJyymuJwZIuSOv88cf-5UsSidRSJ9r0dBl0S0KgndCagD6Q"
      }
    ```

??? example "Private JWKS / JWK Set (click to expand)"

    ```json
      {
        "keys": [
           {
               "p": "2dZeNRmZow7uWKzqpOolNf7FUIr6dP5bThwnqpcDca7sP96fzPGaryZmYAawZj7h1UthpDp9b2D5v0-D0fSrbdp-MisaOz_ZL-2kdwyTSIP0ii-4yPHpFqaZuGTbuLmROwDhklTGMoYC4fN8vb0jgE6cR33bA52JH255qz5R1rc",
               "kty": "RSA",
               "q": "pIt7sgMqDPGZDMiksZ19R9iuUZk5ZcsnPeI0yAGIaEp75Nc7IH9F1LQ8mPw-wtV3Yde26mByszjeskVfldlReZmzeCTXq4jgu5WEi2GM7craTZj-ES7SLkuP21uvbgxGCLxEizr4RCdZD8TtkxcSG2-GPkp-N4IX9187kvWbWl8",
               "d": "R_P82iKNJflwkPnpOr5eGmtekLvTq1cZwJ7M0vbox3LlVmpIP9iRPKVEwuBva0ybRu1pkvM4S3DFgYK6gKjHVzPYl6lHvKZxbFyP8lJoaj1km2NhA3cwqJjqkx4VAJhLlEuG5wDlTSRXNpzqfamdZcH-XMG2rM-nh6yFqbSzyaeO99ZnGMDp5mZvzGuR0VmV6IXPXqelP4uT9cPQD60h1v2DaOKlmd-0ghGfdHa0hzR5S8C55oZ5hF1_bhgx6tA8VzC1jp41mDbKmKAOKvcFG2T9JQRBml2izRVVaCsVN0_ZCR7NhQYrkreqgVN_ZLlgzI6YSA2EN1FWmc9GvNFAbQ",
               "e": "AQAB",
               "use": "sig",
               "kid": "ut-Fle8JH9IdPqo7QDDakblWR1DdvMIijJT9A-lVntk",
               "qi": "uoncSFVC9_vS652rNSZQO8I7KCk0b2bpt38Sb1iQ8Vha5lYkrTp-AsZLoduj7TscCCqlftm9R-FkfERjEYZLdPKQIaGcCQ-L0RzIG_K3w48Tk2T_EEiMqds4UeBpQxccMjUvX-t_b7pwMjFL1RIEBSWAxg5YShT8C83hv0llh9Y",
               "dp": "BLMxWSfyPqhl0Bf7AA_lOaMDktdMzBVo1uiYmn-jnWJOypn9DKjx03Gap9u9Fpeou7dipe51ImAPQ2dtyqvivv4F1wNDD6AzCWuxLrhgvSHLtueMrxk5FDoH-wiCDRxD2-gK9eNKW3C0wzdDq7xW9b-8c3ZtsUhG2xzBF0bC8UU",
               "alg": "RS256",
               "dq": "R_ji4BhWOlcq9NaGg1I5zEVQ6kw1OPtFbOIW6C0Td1qtGomySSKibslvgBNFeH9auqdaUOZjBVWowx1pE-h8pM3AHJsw4sz6T9K0qSrAM_r4xdxXtThfovRWNkLCV0ZzE7sV2DixA06avDUNHbuHpgyAEZsP3kO_K-qx6jQYAc0",
               "n": "jAQFAKQ9omNtb_I2iSryCulJnkB56qGf35fA1RrDBLup7ysJCez9dnu-HTZ62SKoe-9Pxu-4WzjjBNQacotUXYTIi7GFWM5Pyb4ha-bBJprbiwhyrYGIVzZw4LIcleexWPcIOI0cTKmpM6qKb9_6CTFa-A6uX_16n-n3fQjWGPKrJBY7mcIalJ4YTmLhavs6yt6efSD67SaJ2FabzjouRa_yeDmsGPq2LA-4FymDvuGCHeeMtPO9ClnA2eWC15L7n3-Pagm5pso5GchORl2Rwr_bhCmNCKsC_Qh6TqTHJyymuJwZIuSOv88cf-5UsSidRSJ9r0dBl0S0KgndCagD6Q"
            }
         ]
      }
    ```

### Public Keys

Every private key will have an associated _public_ key that can be freely distributed to other parties. The main purpose
of these public keys is to _verify_ signatures attached to payloads (such as JWTs) that were signed using the private
key.

In most cases, the only public keys you need to concern yourselves with are
the [public keys belonging to the identity provider](#jwks-endpoint-public-keys) you're using. These are needed
to [verify the signatures](#signature-validation) of the tokens that are signed and issued by the identity
provider.

Conversely, your client application might use [client assertions](#client-assertion) to authenticate itself
with an identity provider. As part of the automated provisioning process, the platform will pre-register corresponding
_public_ keys for your client at the identity provider. The identity provider will in turn use these public keys to
verify the signature of your client assertions as proof of your client's identity.

??? example "Public JWK (click to expand)"

    ```json
      {
          "kty": "RSA",
          "e": "AQAB",
          "use": "sig",
          "kid": "ut-Fle8JH9IdPqo7QDDakblWR1DdvMIijJT9A-lVntk",
          "alg": "RS256",
          "n": "jAQFAKQ9omNtb_I2iSryCulJnkB56qGf35fA1RrDBLup7ysJCez9dnu-HTZ62SKoe-9Pxu-4WzjjBNQacotUXYTIi7GFWM5Pyb4ha-bBJprbiwhyrYGIVzZw4LIcleexWPcIOI0cTKmpM6qKb9_6CTFa-A6uX_16n-n3fQjWGPKrJBY7mcIalJ4YTmLhavs6yt6efSD67SaJ2FabzjouRa_yeDmsGPq2LA-4FymDvuGCHeeMtPO9ClnA2eWC15L7n3-Pagm5pso5GchORl2Rwr_bhCmNCKsC_Qh6TqTHJyymuJwZIuSOv88cf-5UsSidRSJ9r0dBl0S0KgndCagD6Q"
      }
    ```

??? example "Public JWKS / JWK Set (click to expand)"

    ```json
      {
         "keys": [
            {
               "kty": "RSA",
               "e": "AQAB",
               "use": "sig",
               "kid": "ut-Fle8JH9IdPqo7QDDakblWR1DdvMIijJT9A-lVntk",
               "alg": "RS256",
               "n": "jAQFAKQ9omNtb_I2iSryCulJnkB56qGf35fA1RrDBLup7ysJCez9dnu-HTZ62SKoe-9Pxu-4WzjjBNQacotUXYTIi7GFWM5Pyb4ha-bBJprbiwhyrYGIVzZw4LIcleexWPcIOI0cTKmpM6qKb9_6CTFa-A6uX_16n-n3fQjWGPKrJBY7mcIalJ4YTmLhavs6yt6efSD67SaJ2FabzjouRa_yeDmsGPq2LA-4FymDvuGCHeeMtPO9ClnA2eWC15L7n3-Pagm5pso5GchORl2Rwr_bhCmNCKsC_Qh6TqTHJyymuJwZIuSOv88cf-5UsSidRSJ9r0dBl0S0KgndCagD6Q"
            }
         ]
      }
    ```

---

## Login proxy

NAIS offers an opt-in _login proxy_ (also known as _Wonderwall_) that simplifies the process of authenticating end-users in your application.

<<gcp_only("Login proxy")>>

When enabled, the proxy exposes [endpoints](../reference/README.md#endpoints) under your application's ingress.
These endpoints help you:

- :dart: [authenticate employees via Entra ID](../entra-id/how-to/login.md), or
- :dart: [authenticate citizens via ID-porten](../idporten/how-to/login.md)

The proxy sits in front of your application and intercepts all incoming requests.
It does not validate any requests, nor does it validate any tokens attached to the request.

Unauthenticated requests are proxied as-is without modifications:

```mermaid
graph LR
  style Proxy stroke:#0f0,stroke-dasharray: 5
  style Application stroke:#f00
    
  U((User)) -- "request" --> Proxy["Login proxy"]
  Proxy -. "`proxy request
  as-is`" .-> Application
```

To log in an end-user, redirect them to the [login endpoint](../reference/README.md#login-endpoint).
This performs the [OpenID Connect Authorization Code Flow](#openid-connect) with the identity provider.
After successful login, the proxy creates and stores a session for the end-user.
The session identifier is then stored in the user's browser as a cookie.

```mermaid
graph LR
    style Proxy stroke:#0f0,stroke-dasharray: 5
    IDP[Identity Provider]
    style IDP stroke:#f00

    U((User)) -- "/oauth2/login" --> Proxy["Login proxy"]

    subgraph OIDC["OIDC Auth Code Flow"]
        IDP -- "redirect callback" ---> Proxy
        Proxy -- "redirect to log in" ---> IDP
    end
```

When the user makes a request to your application's ingress, the proxy intercepts the request and checks for the session cookie.
This is translated to the user's access token. The token is then attached in the `Authorization` header as a [Bearer token](../../auth/explanations/README.md#bearer-token).
Finally, the request is forwarded to your application.

```mermaid
graph LR
  style Proxy stroke:#0f0,stroke-dasharray: 5
  style Application stroke:#f00

  subgraph Session["Authenticated Session"]
    direction LR
    U((User)) -- "request" --> Proxy["Login proxy"]
    Proxy -. "`proxy request
    with token`" .-> Application
  end
```

All of this happens on the server side, which means that neither the token nor the header are visible from the user's browser.

The proxy does not validate this token.
[Validation](#token-validation) is your application's responsibility.

### Sessions

When an end-user logs in and authenticates themselves, they receive a session.
Sessions are stored server-side and are managed by the login proxy.

A session has three possible states:

| State    | Authenticated | Description                                  |
|----------|:-------------:|----------------------------------------------|
| Active   |     ✅ Yes     |                                              |
| Inactive |     ❌ No      | session has reached the _inactivity timeout_ |
| Expired  |     ❌ No      | session has reached its _maximum lifetime_   |

Users with an inactive or expired session must perform a new login to receive a new, valid session.

See the [session management reference](../reference/README.md#session-management) for details.

### Autologin

Autologin configures the login proxy to enforce authenticated user sessions.
If autologin is enabled, the proxy short-circuits all unauthenticated requests before they reach your application.

!!! danger "Autologin vs. token validation"

    Autologin does **not** perform nor is it a replacement for [token validation](#token-validation).

    We recommend that you always validate tokens in requests for any endpoint that requires authentication.
    Validation is especially important for requests that access sensitive data or otherwise performs operations that modify state.

Specific [paths can optionally be excluded from autologin](../reference/README.md#autologin-exclusions).
Requests to these paths will pass through the proxy to your application without any enforcement.

See the [autologin reference](../reference/README.md#autologin) for details.

## Texas

Texas is an abbreviation for *Token Exchange as a Service* that runs as local service together with your application.
It handles the boring parts of OAuth 2.0 and JWTs - so that your application doesn't have to.

Texas offers HTTP endpoints for:

- getting machine tokens
- exchanging user tokens into on-behalf-of tokens
- token validation with introspection

???+ warning "Texas is currently in opt-in public beta"

    To enable for your application, set the `texas.nais.io/enabled: "true"` annotation on your `Application`:

    ```yaml title="app.yaml" hl_lines="5"
    apiVersion: "nais.io/v1alpha1"
    kind: "Application"
    metadata:
      annotations:
        texas.nais.io: enabled
    ```

All available [identity providers](#identity-provider) are supported. See their respective pages for usage details.

See the [Texas reference](../reference/README.md#texas) for API specifications and available environment variables.

## Further Reading

- <https://nais.io/blog/posts/oauth1/>
- <https://nais.io/blog/posts/oauth2/>
- <https://nais.io/blog/posts/oauth-del3-pkce/>
- <https://oauth.net/2/>
- <https://oauth.net/2.1/>
- <https://openid.net/connect/>
- <https://connect2id.com/learn/oauth-2>
- <https://infosec.mozilla.org/guidelines/iam/openid_connect.html>
- <https://pragmaticwebsecurity.com/files/cheatsheets/oauth2securityfordevelopers.pdf>

{%- else %}

## Login proxy

NAIS offers an opt-in _login proxy_ (also known as [_Wonderwall_](https://github.com/nais/wonderwall)) that simplifies the process of authenticating end-users in your application.

When enabled, the proxy exposes [endpoints](../reference/README.md#endpoints) under your application's ingress.

The proxy sits in front of your application and intercepts all incoming requests.
It does not validate any requests, nor does it validate any tokens attached to the request.

**:dart: Learn [how to authenticate users with the login proxy](../how-to/login.md)**

### How it works

Unauthenticated requests are proxied as-is without modifications:

```mermaid
graph LR
  style Proxy stroke:#0f0,stroke-dasharray: 5
  style Application stroke:#f00
    
  U((User)) -- "request" --> Proxy["Login proxy"]
  Proxy -. "`proxy request
  as-is`" .-> Application
```

To log in an end-user, redirect them to the [login endpoint](../reference/README.md#login-endpoint).
This performs the OpenID Connect Authorization Code Flow with the identity provider.
After successful login, the proxy creates and stores a session for the end-user.
The session identifier is then stored in the user's browser as a cookie.

```mermaid
graph LR
    style Proxy stroke:#0f0,stroke-dasharray: 5
    IDP[Identity Provider]
    style IDP stroke:#f00

    U((User)) -- "/oauth2/login" --> Proxy["Login proxy"]

    subgraph OIDC["OIDC Auth Code Flow"]
        IDP -- "redirect callback" ---> Proxy
        Proxy -- "redirect to log in" ---> IDP
    end
```

When the user makes a request to your application's ingress, the proxy intercepts the request and checks for the session cookie.
This is translated to the user's access token. The token is then attached in the `Authorization` header as a Bearer token.
Finally, the request is forwarded to your application.

```mermaid
graph LR
  style Proxy stroke:#0f0,stroke-dasharray: 5
  style Application stroke:#f00

  subgraph Session["Authenticated Session"]
    direction LR
    U((User)) -- "request" --> Proxy["Login proxy"]
    Proxy -. "`proxy request
    with token`" .-> Application
  end
```

All of this happens on the server side, which means that neither the token nor the header are visible from the user's browser.

The proxy does not validate the access token.
Validation is your application's responsibility.

### Sessions

When an end-user logs in and authenticates themselves, they receive a session.
Sessions are stored server-side and are managed by the login proxy.

A session has two possible states:

| State    | Authenticated | Description                                  |
|----------|:-------------:|----------------------------------------------|
| Active   |     ✅ Yes     |                                              |
| Expired  |     ❌ No      | session has reached its _maximum lifetime_   |

Users with an expired session must perform a new login to receive a new, valid session.

See the [session management reference](../reference/README.md#session-management) for details.

### Enforce login

The enforce mode configures the login proxy to enforce authenticated user sessions.
If enabled, the proxy will short-circuit all unauthenticated requests before they reach your application.

Specific [paths can optionally be excluded from enforcement](../reference/README.md#enforce-mode-exclusions).
Requests to these paths will pass through the proxy to your application, regardless of session states.

See the [enforce mode reference](../reference/README.md#enforce-login) for details.

{%- endif %}
