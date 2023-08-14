# Tokens

A _token_ (in the context of authentication) is a piece of data that contains information about the entity to be
authenticated. By presenting a token during authenticated requests, the receiving party can verify claims and
information about the entity that the request is performed on behalf of before responding or granting access to a
resource.

An advantage of using a token is that the user never has to directly present their private credentials or passwords to
the resource server. Instead, the user will have to log in to a trusted third-party that an organization delegates to,
i.e. an [identity provider](actors.md#identity-provider). The identity provider will issue a token that the client
application can use to authenticate itself to a resource server on behalf of a user, if any.

The token itself can be self-contained, meaning that it contains all the information necessary for
a [resource server](actors.md#resource-server) to make assertions about the entity that the token is associated with.
Additionally, the token will often have an expiry time to limit its use to a typical user session.

Most references to the word "token" in our case actually refers to a self-contained JSON Web Token ([JWT](#jwt)). Though
it should be noted that a JWT is a token, but not all tokens are JWTs.

---

## Bearer Token

A token is generally used as a [_Bearer_ token](https://datatracker.ietf.org/doc/html/rfc6750). Most resource servers
in NAV will require that you supply the bearer token in the `Authorization` header, as specified
in [RFC 6750, section 2.1](https://datatracker.ietf.org/doc/html/rfc6750#section-2.1):

```
GET /resource HTTP/1.1

Host: as.example.com
Authorization: Bearer eyJhbGciOiJFUzI1NiIsImtpZCI6IjE2In0...
```

---

## JWT

JSON Web Token (JWT) is a compact, self-contained means of representing claims as a JSON object to be transferred
between two parties, as specified in [RFC 7519](https://tools.ietf.org/html/rfc7519).

The contained claims can be verified and trusted by validating its digital signature.

In most cases, the JWT is signed using an asymmetric secret, i.e. public and private key pair:

1. The sending party will sign the JWT using their private key.
2. The receiving party may verify the signature using the signer's associated public key, which may be distributed
   out-of-band or [published at a well-known endpoint](actors.md#jwks-endpoint-public-keys).

### Contents

A JWT will look something like this in its serialized, compact form (where each part is base64-URL-encoded):

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
```

The token consists of three parts:

```
<header>.<payload>.<signature>
```

### Header

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

### Payload

The payload contains _claims_ about the associated user or principal that the token represents as well as additional
data.

JWTs will mostly consist of [registered claims](https://datatracker.ietf.org/doc/html/rfc7519#section-4.1) or "standard"
claims. Depending on the identity provider however, additional claims may be included.

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

### Signature

While the RFC does not require a JWT to contain a signature, a JWT will quickly lose its value if it does not have a
signature at all. The signature is used to verify the integrity of the information contained within the token. Any
recipient of the JWT can verify that the token, nor its contents, has been tampered with or modified at any point after
being issued by the issuer.

Signatures are created by using the header and payload as input. Use a library to do this instead of implementing it
yourselves, see [best practices](#best-practices).

!!! info "Further Reading"

    Interested readers may find a more thorough introduction on JWTs here:

    - <https://jwt.io/introduction>

    And, of course (for the adventurous), the RFC itself:

    - [RFC 7519](https://tools.ietf.org/html/rfc7519)

---

## ID Token

An _ID token_ is only included as part of the OpenID Connect standard. It is required to be a [JWT](#jwt). The ID token
is strictly used for _authentication_ of end-users. It should never be sent to
a [resource server](actors.md#resource-server) (an API server).

The ID token only asserts that a user has been logged in at the identity provider and authenticated, and that the
intended recipient is the client application that initiated the login.

However, the ID token itself should not grant access to any resource on behalf of the end-user. This is because the
intended recipient of the token (the `aud` or audience claim) is equal to the client application, not the resource
server. The correct token to use in such cases is an [_access token_](#access-token).

---

## Access Token

An _access token_ is a token that allows the client application to perform authenticated requests on behalf of the
end-user. In OAuth 2.0 terms, this is what is known as _delegated authorization_.

The token should be used when performing requests to a [resource server](actors.md#resource-server), and the resource
server should [validate the token](#token-validation).

Access tokens are often in the form of [JWTs](#jwt) as they're self-contained, which allows for local validation
without the need for network calls.

All the [identity providers](actors.md#identity-provider) we use will issue access tokens in the form of JWTs.

!!! info "More on ID Token vs Access Token"

    Auth0 has a great blog post on this: <https://auth0.com/blog/id-token-access-token-what-is-the-difference/>

    And an accompanying video if you prefer: <https://www.youtube.com/watch?v=M4JIvUIE17c>

---

## Refresh Token

A _refresh token_ is an opaque string (only meaningful for the recipient, i.e. an identity provider) that may be
included as part of the token set returned when
performing [authentication flows in OpenID Connect](protocols.md#openid-connect).

The token can be used to obtain additional access tokens from the identity provider for the token's associated user
session in order to extend a user's session whenever the original access token is no longer valid.

Beware though, a refresh token is quite powerful as it allows an application to obtain access tokens for a user as long
as the refresh token is valid. Thus, the refresh token should be stored securely (server-side) and not be used for
prolonged periods.

As best practice, you should expire a session if:

1. The user has been authenticated for some longer period of time, e.g. a typical workday of 8 hours or so
2. The user has been inactive for some time, e.g. 15 - 30 minutes.

The user should ideally be redirected to the identity provider to ensure that the user can still identify themselves, if
necessary. This is to remediate potential abuse from any adversaries that may have shared access to the user client, for
example when the user has forgotten to log out and is no longer present at the device.

---

## Token Validation

Tokens should be validated before granting access to resources. There are two distinct cases where your client should
perform such validation:

1. Your client is a [resource server](actors.md#resource-server) / API that receives authenticated requests from
   consumers ([RFC 6749, Section 7](https://datatracker.ietf.org/doc/html/rfc6749?#section-7))
2. Your client performs the [OpenID Connect Authorization Code Flow](protocols.md#authorization-code-flow)
   ([OpenID Connect Core 1.0, Section 3.1.3.5](https://openid.net/specs/openid-connect-core-1_0.html#TokenResponseValidation))

In both cases, we have a set of self-contained JWTs (both ID Tokens and Access Tokens) that should be validated.
Validation involves the following steps:

1. Parsing and decoding the [JWT](#jwt)
2. Validating the [signature](#signature) and its algorithm
3. Validating the [claims](#payload) in the payload

Validation must be performed before granting access to any [resource server](actors.md#resource-server) / API.

Access Tokens must always be validated by the Resource Server / API before granting access. Clients should normally just
pass the access token along to the resource server without any processing of it, however if any processing is performed,
clients must also perform such validation.

### Signature Validation

A JWT usually contains the `kid` (key ID) claim in the token's [header](#header) to indicate which key was used to sign
the token. The signature can then be verified by finding the matching [public key](cryptography.md#public-keys) from the
provider's [`jwks_uri` endpoint](actors.md#jwks-endpoint-public-keys).

There are a number of algorithms that can be used to sign a JWT, defined
in [RFC 7518, Section 3.1](https://datatracker.ietf.org/doc/html/rfc7518#section-3.1). The algorithm used to sign a JWT
is indicated by the `alg` claim in the token's [header](#header).

For our providers, the algorithm should be at least `RS256`. If the algorithm is set to `none` or the JWT is not signed,
the request should be rejected.

### Claims Validation

ID Tokens have a defined set of standard claims and steps required for validation of these in the
[OIDC Core specification, Section 3.1.3.7](https://openid.net/specs/openid-connect-core-1_0.html#IDTokenValidation).
Validation of JWT Access Tokens is specified in [RFC 9068](https://datatracker.ietf.org/doc/html/rfc9068).
As the specification is relatively new however, it is not fully supported by many of our providers.

Generally speaking, the most important JWT claims to validate are the following:

- `iss` (**issuer**)
    - The issuer of the token. This should be exactly equal to the [issuer](actors.md#issuer) property declared by the
      provider's [metadata document](actors.md#well-known-url-metadata-document)
- `aud` (**audience**)
    - The expected recipient of the token.
    - The value of this is usually a unique identifier such as a [client ID](actors.md#client-id) that belongs to either
      the [client](actors.md#client) or [resource server](actors.md#resource-server) that the token is intended for.
    - For ID-porten tokens: this claim is optional and _may_ not be included. You should configure any validators to not require the claim.
- `exp` (**expiration time**)
    - The timestamp for which the token expires, in unix time (seconds since epoch). The token is invalid if it is used
      after this time.
- `iat` (**issued at time**)
    - The timestamp for which the token was issued, in unix time (seconds since epoch). This can be used to determine
      the age of the token.
- `nbf` (**not before time**)
    - The timestamp for which the token is considered valid, in unix time (seconds since epoch). The token is invalid if
      it is used before this time.
    - This is an optional claim, but it is often included.

If any of the above claims are missing or contain unexpected values, validation should fail and the token should be
rejected. Most libraries will have implementations to validate these claims as they're fairly standard.

#### Azure AD

List of notable claims for access tokens from Azure AD that might be useful:

- `azp` (**authorized party**)
    - The [client ID](actors.md#client-id) of the application that requested the token.
- `groups` (**groups**)
    - JSON array of object IDs for [Azure AD groups](../azure-ad/concepts.md#groups).
    - In order for a group to appear in the claim, all the following conditions must be true:
        - The given user is a direct member of the group.
        - The group is [assigned to the client](../azure-ad/configuration.md#groups).
- `idtyp` (**identity type**)
    - This is a special claim used to determine whether a token is a [machine-to-machine](../azure-ad/usage.md#oauth-20-client-credentials-grant) (app-only) token or a user/[on-behalf-of](../azure-ad/usage.md#oauth-20-on-behalf-of-grant) token.
    - The claim currently only appears in machine-to-machine tokens. The value is `app` when the token is a machine-to-machine token.
    - In short: if the `idtyp` claim exists and it has the value `app`, then it is a machine-to-machine token. Otherwise, it is a user/on-behalf-of token.
- [Extra NAV-specific claims](../azure-ad/configuration.md#extra) that can be added to tokens for your client.

See <https://learn.microsoft.com/en-us/azure/active-directory/develop/access-token-claims-reference> for a complete list of claims.
Tokens in NAV are v2.0 tokens.

#### ID-porten

List of notable claims for access tokens from ID-porten that might be useful:

- `acr` (**Authentication Context Class Reference**)
    - The [security level](../idporten.md#security-levels) used for authenticating the end-user.
- `pid` (**personidentifikator**)
    - The Norwegian national ID number (fødselsnummer/d-nummer) of the authenticated end user.

See <https://docs.digdir.no/docs/idporten/oidc/oidc_protocol_access_token> for the complete list of claims.

### Best Practices

In most cases, you should _not_ parse and validate tokens manually. It is strongly recommended that you use well-known
and widely used libraries and frameworks that takes care of most of the heavy lifting (parsing, validation of signature
and standard claims) for you.

See [libraries and frameworks](../overview/development.md#libraries-and-frameworks) for a non-comprehensive list.
