---
tags: [maskinporten, how-to]
---

# Consume external API using Maskinporten

This how-to guides you through the steps required to consume an API secured with [Maskinporten](../README.md):

1. [Declare the scopes that you want to consume](#declare-consumer-scopes)
2. [Acquire tokens from Maskinporten](#acquire-token)
3. [Consume the API using the token](#consume-api)

## Declare consumer scopes

Declare all the scopes that you want to consume in your application's NAIS manifest so that your application is granted access to them:

```yaml hl_lines="5-7" title="nais.yaml"
spec:
  maskinporten:
    enabled: true
    scopes:
      consumes:
        - name: "skatt:some.scope"
        - name: "nav:some/other/scope"
```

The scopes themselves are defined and owned by the external API provider. The exact scope values must be exchanged out-of-band.

{%- if tenant() == "nav" %}
???+ warning "Ensure that organization has access to scopes"

    Make sure that the provider has granted NAV (organization number `889640782`) access to any scopes that you wish to consume.

    Provisioning of client will fail otherwise.

???+ warning "Use webproxy for outbound network connectivity from on-premises environments"

    If you're on-premises, you must enable and use [`webproxy`](../../../workloads/application/reference/application-spec.md#webproxy) to access Maskinporten.

{%- endif %}

## Acquire token

To acquire a token from Maskinporten, you will need to create a [client assertion](../../explanations/README.md#client-assertion).

### Create client assertion

The client assertion is a JWT that consists of a **header**, a **payload** and a **signature**.

The **header** should consist of the following parameters:

| Parameter | Value            | Description                                                                                                                                                                                                     |
|:----------|:-----------------|:----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **`kid`** | `<kid-from-JWK>` | The key identifier of the [private JWK](../../explanations/README.md#private-keys) used to sign the assertion. The private key is found in the [`MASKINPORTEN_CLIENT_JWK` environment variable][variables-ref]. |
| **`typ`** | `JWT`            | Represents the type of this JWT. Set this to `JWT`.                                                                                                                                                             |
| **`alg`** | `RS256`          | Represents the cryptographic algorithm used to secure the JWT. Set this to `RS256`.                                                                                                                             |

The **payload** should have the following claims:

| Claim       | Example Value                          | Description                                                                                               |
|:------------|:---------------------------------------|:----------------------------------------------------------------------------------------------------------|
| **`aud`**   | `https://test.maskinporten.no/`        | The _audience_ of the token. Set to the [`MASKINPORTEN_ISSUER` environment variable][variables-ref].      |
| **`iss`**   | `60dea49a-255b-48b5-b0c0-0974ac1c0b53` | The _issuer_ of the token. Set to the [`MASKINPORTEN_CLIENT_ID` environment variable][variables-ref].     |
| **`scope`** | `nav:test/api`                         | `scope` is a whitespace-separated list of scopes that you want in the issued token from Maskinporten.     |
| **`iat`**   | `1698435010`                           | `iat` stands for _issued at_. Set to now.                                                                 |
| **`exp`**   | `1698435070`                           | `exp` is the _expiration time_. Between 1 and 120 seconds after now. Typically 30 seconds is fine         |
| **`jti`**   | `2d1a343c-6e7d-4ace-ae47-4e77bcb52db9` | The _JWT ID_ of the token. Used to uniquely identify a token. Set this to a unique value such as an UUID. |

If the API provider requires the use of an [audience-restricted token](https://docs.digdir.no/maskinporten_func_audience_restricted_tokens.html), you must also include the following claim:

| Claim          | Example Value                   | Description                                                                                                                       |
|:---------------|:--------------------------------|:----------------------------------------------------------------------------------------------------------------------------------|
| **`resource`** | `https://api.some-provider.no/` | Target audience for the token returned by Maskinporten. The exact value is defined by the API provider and exchanged out-of-band. |

Finally, create a **signature** for the client assertion.

???+ example "Example Code for Creating a Client Assertion"

    The sample code below shows how to create and sign a client assertion in a few different languages:

    === "Kotlin"

        Minimal example code for creating a client assertion in Kotlin, using [Nimbus JOSE + JWT](https://connect2id.com/products/nimbus-jose-jwt).

        ```kotlin linenums="1"
        import com.nimbusds.jose.*
        import com.nimbusds.jose.crypto.*
        import com.nimbusds.jose.jwk.*
        import com.nimbusds.jwt.*
        import java.time.Instant
        import java.util.Date
        import java.util.UUID

        val clientId: String = System.getenv("MASKINPORTEN_CLIENT_ID")
        val clientJwk: String = System.getenv("MASKINPORTEN_CLIENT_JWK")
        val issuer: String = System.getenv("MASKINPORTEN_ISSUER")
        val scope: String = "nav:test/api"
        val rsaKey: RSAKey = RSAKey.parse(clientJwk)
        val signer: RSASSASigner = RSASSASigner(rsaKey.toPrivateKey())

        val header: JWSHeader = JWSHeader.Builder(JWSAlgorithm.RS256)
            .keyID(rsaKey.keyID)
            .type(JOSEObjectType.JWT)
            .build()

        val now: Date = Date.from(Instant.now())
        val expiration: Date = Date.from(Instant.now().plusSeconds(60))
        val claims: JWTClaimsSet = JWTClaimsSet.Builder()
            .issuer(clientId)
            .audience(issuer)
            .issueTime(now)
            .claim("scope", scope)
            .expirationTime(expiration)
            .jwtID(UUID.randomUUID().toString())
            .build()

        val jwtAssertion: String = SignedJWT(header, claims)
            .apply { sign(signer) }
            .serialize()
        ```

    === "Python"
        
        Minimal example code for creating a client assertion in Python, using [PyJWT](https://github.com/jpadilla/pyjwt).

        ```python linenums="1"
        import json, jwt, os, uuid
        from datetime import datetime, timezone, timedelta
        from jwt.algorithms import RSAAlgorithm

        issuer = os.getenv('MASKINPORTEN_ISSUER')
        jwk = os.getenv('MASKINPORTEN_CLIENT_JWK')
        client_id = os.getenv('MASKINPORTEN_CLIENT_ID')

        header = {
            "kid": json.loads(jwk)['kid']
        }
        
        payload = {
            "aud": issuer,
            "iss": client_id,
            "scope": "nav:test/api",
            "iat": datetime.now(tz=timezone.utc),
            "exp": datetime.now(tz=timezone.utc)+timedelta(minutes=1),
            "jti": str(uuid.uuid4())
        }

        private_key = RSAAlgorithm.from_jwk(jwk)
        jwtAssertion = jwt.encode(payload, private_key, "RS256", header)
        ```

### Request token from Maskinporten

**Request**

The token request is an HTTP POST request.
It should have the `Content-Type` set to `application/x-www-form-urlencoded`

The body of the request should contain the following parameters:

| Parameter    | Value                                         | Description                                                                                |
|:-------------|:----------------------------------------------|:-------------------------------------------------------------------------------------------|
| `grant_type` | `urn:ietf:params:oauth:grant-type:jwt-bearer` | Type of grant the client is sending. Always `urn:ietf:params:oauth:grant-type:jwt-bearer`. |
| `assertion`  | `eyJraWQ...`                                  | The client assertion itself. It should be unique and only used once.                       |

Send the request to the `token_endpoint`, i.e. the URL found in the [`MASKINPORTEN_TOKEN_ENDPOINT`][variables-ref] environment variable:

```http
POST ${MASKINPORTEN_TOKEN_ENDPOINT} HTTP/1.1
Content-Type: application/x-www-form-urlencoded

grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&
assertion=eY...
```

**Response**

Maskinporten will respond with a JSON object that contains the access token.

```json
{
    "access_token": "eyJraWQ...",
    "expires_in": 3599,
    ...
}
```

???+ tip "Cache your tokens"

    The `expires_in` field in the response indicates the lifetime of the token in seconds.

    Use this field to cache and reuse the token to minimize network latency impact.

See the [Maskinporten token documentation](https://docs.digdir.no/docs/Maskinporten/maskinporten_protocol_token) for more details.

## Consume API

Once you have acquired the token, you can finally consume the external API.

Use the token in the `Authorization` header as a [Bearer token](../../explanations/README.md#bearer-token):

```http
GET /resource HTTP/1.1

Host: api.example.com
Authorization: Bearer eyJraWQ...
```

[variables-ref]: ../reference/README.md#variables-for-acquiring-tokens
