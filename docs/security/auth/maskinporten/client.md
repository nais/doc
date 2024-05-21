---
tags: [maskinporten]
---

# Maskinporten Client

The NAIS platform provides support for declarative provisioning of Maskinporten clients.

A [client](../../../auth/explanations/README.md#client) allows your application to integrate with Maskinporten to acquire access tokens.
These tokens authenticate your application when consuming external APIs whom require Maskinporten tokens.

## Spec

```yaml title="nais.yaml"
spec:
  maskinporten:
    enabled: true 
    scopes:
      consumes:
        - name: "skatt:some.scope"
        - name: "nav:some/other/scope"

  # required for on-premises only
  webproxy: true
```

See the [NAIS manifest reference](../../../workloads/application/reference/application-spec.md#maskinporten) for the complete specification.

## Network Connectivity

Maskinporten is an external service.
The platform automatically configures outbound access to the Maskinporten hosts.

You do _not_ have to explicitly configure outbound access to Maskinporten yourselves in GCP.

If you're on-premises however, you must enable and use [`webproxy`](../../../workloads/application/reference/application-spec.md#webproxy).

## Runtime Variables & Credentials

Your application will automatically be injected with both environment variables and files at runtime.
You can use whichever is most convenient for your application.

The files are available at the following path: `/var/run/secrets/nais.io/maskinporten/`

| Name                          | Description                                                                                               |
|:------------------------------|:----------------------------------------------------------------------------------------------------------|
| `MASKINPORTEN_CLIENT_ID`      | [Client ID](../../../auth/explanations/README.md#client-id) that uniquely identifies the client in Maskinporten.                |
| `MASKINPORTEN_CLIENT_JWK`     | [Private JWK](../../../auth/explanations/README.md#private-keys) (RSA) for the client.                                          |
| `MASKINPORTEN_SCOPES`         | Whitespace-separated string of scopes registered for the client.                                          |
| `MASKINPORTEN_WELL_KNOWN_URL` | The well-known URL for the [metadata discovery document](../../../auth/explanations/README.md#well-known-url-metadata-document) |
| `MASKINPORTEN_ISSUER`         | `issuer` from the [metadata discovery document](../../../auth/explanations/README.md#issuer).                                   |
| `MASKINPORTEN_TOKEN_ENDPOINT` | `token_endpoint` from the [metadata discovery document](../../../auth/explanations/README.md#token-endpoint).                   |

These variables are used when acquiring tokens.

## Getting Started

To consume external APIs, you will need to do three things:

1. Declare the scopes that you want to consume
2. Acquire tokens from Maskinporten
3. Consume the API using the token

### 1. Declare Consumer Scopes

Declare all the scopes that you want to consume in your application's NAIS manifest so that the client is granted access to them:

```yaml hl_lines="5-7" title="nais.yaml"
spec:
  maskinporten:
    enabled: true
    scopes:
      consumes:
        - name: "skatt:some.scope"
        - name: "nav:some/other/scope"
```

The scopes themselves are defined and owned by the external API provider. The exact scope values must thus be exchanged out-of-band.

Make sure that the provider has granted **NAV** (organization number `889640782`) consumer access to any scopes that you wish to consume.
Provisioning of client will fail otherwise.

### 2. Acquire Token

To acquire a token from Maskinporten, you will need to create a JWT grant.

A JWT grant is a [JWT](../../../auth/explanations/README.md#jwt) that is used to [authenticate your client](../../../auth/explanations/README.md#client-assertion) with Maskinporten.
The token is signed using a [private key](../../../auth/explanations/README.md#private-keys) belonging to your client.

#### 2.1. Create JWT Grant

The JWT consists of a **header**, a **payload** and a **signature**.

The **header** should consist of the following parameters:

| Parameter | Value            | Description                                                                                                                                                                                                                                                |
|:----------|:-----------------|:-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **`kid`** | `<kid-from-JWK>` | The key identifier of the [private JWK](../../../auth/explanations/README.md#private-keys) used to sign the assertion. The private key is found in the `MASKINPORTEN_CLIENT_JWK` [environment variable](#runtime-variables-credentials).                                         |
| **`typ`** | `JWT`            | Represents the type of this JWT. Set this to `JWT`.                                                                                                                                                                                                        |
| **`alg`** | `RS256`          | Represents the cryptographic algorithm used to secure the JWT. Set this to `RS256`.                                                                                                                                                                        |

The **payload** should have the following claims:

| Claim       | Example Value                          | Description                                                                                                                                                                                                                                      |
|:------------|:---------------------------------------|:-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **`aud`**   | `https://test.maskinporten.no/`        | The _audience_ of the token. Set this to the Maskinporten `issuer`, i.e. [`MASKINPORTEN_ISSUER`](#runtime-variables-credentials).                                                                                                                |
| **`iss`**   | `60dea49a-255b-48b5-b0c0-0974ac1c0b53` | The _issuer_ of the token. Set this to your `client_id`, i.e. [`MASKINPORTEN_CLIENT_ID`](#runtime-variables-credentials).                                                                                                                        |
| **`scope`** | `nav:test/api`                         | `scope` is a whitespace-separated list of scopes that you want in the issued token from Maskinporten.                                                                                                                                            |
| **`iat`**   | `1698435010`                           | `iat` stands for _issued at_. Timestamp (seconds after Epoch) for when the JWT was issued or created.                                                                                                                                            |
| **`exp`**   | `1698435070`                           | `exp` is the _expiration time_. Timestamp (seconds after Epoch) for when the JWT is no longer valid. This **must** be less than **120** seconds after `iat`. That is, the maximum lifetime of the token must be no greater than **120 seconds**. |
| **`jti`**   | `2d1a343c-6e7d-4ace-ae47-4e77bcb52db9` | The _JWT ID_ of the token. Used to uniquely identify a token. Set this to a UUID or similar.                                                                                                                                                     |

The JWT grant should be unique and only used once. That is, every token request to Maskinporten should have a unique JWT grant:

- Set the JWT ID (`jti`) claim to a unique value, such as an UUID.
- Set the JWT expiry (`exp`) claim so that the lifetime of the token is reasonably low:
    - The _maximum_ lifetime allowed is 120 seconds.
    - A lifetime between 10-30 seconds should be fine for most situations.

If the API provider requires the use of an [audience-restricted token](https://docs.digdir.no/maskinporten_func_audience_restricted_tokens.html), you must also include the following claim:

| Claim          | Example Value                   | Description                                                                                                                       |
|:---------------|:--------------------------------|:----------------------------------------------------------------------------------------------------------------------------------|
| **`resource`** | `https://api.some-provider.no/` | Target audience for the token returned by Maskinporten. The exact value is defined by the API provider and exchanged out-of-band. |

Finally, a **signature** is created by hashing the header and payload, and then signing the hash using your client's private key.

??? example "Example Code for Creating a JWT Grant"

    The sample code below shows how to create and sign a JWT grant in a few different languages:

    === "Kotlin"

        Minimal example code for creating a JWT grant in Kotlin, using [Nimbus JOSE + JWT](https://connect2id.com/products/nimbus-jose-jwt).

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

        val jwtGrant: String = SignedJWT(header, claims)
            .apply { sign(signer) }
            .serialize()
        ```

    === "Python"
        
        Minimal example code for creating a JWT grant in Python, using [PyJWT](https://github.com/jpadilla/pyjwt).

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
        grant = jwt.encode(payload, private_key, "RS256", header)
        ```

#### 2.2. Request Token from Maskinporten

**Request**

The token request is an HTTP POST request.
It should have the `Content-Type` set to `application/x-www-form-urlencoded`

The body of the request should contain the following parameters:

| Parameter    | Value                                         | Description                                                                                |
|:-------------|:----------------------------------------------|:-------------------------------------------------------------------------------------------|
| `grant_type` | `urn:ietf:params:oauth:grant-type:jwt-bearer` | Type of grant the client is sending. Always `urn:ietf:params:oauth:grant-type:jwt-bearer`. |
| `assertion`  | `eyJraWQ...`                                  | The JWT grant itself.                                                                      |

Send the request to the `token_endpoint`, i.e. [`MASKINPORTEN_TOKEN_ENDPOINT`](#runtime-variables-credentials):

```http
POST ${MASKINPORTEN_TOKEN_ENDPOINT} HTTP/1.1
Content-Type: application/x-www-form-urlencoded

grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&
assertion=eY...
```

**Response**

Maskinporten will respond with a JSON object.

```json
{
    "access_token": "eyJraWQ...",
    "token_type": "Bearer",
    "expires_in": 3599,
    "scope": "nav:test/api"
}
```

| Parameter               | Description                                                                                                          |
|:------------------------|:---------------------------------------------------------------------------------------------------------------------|
| `access_token`          | The access token that you may use to consume an external API.                                                        |
| `token_type`            | The token type. Should always be `Bearer`.                                                                           |
| `expires_in`            | The lifetime of the token in seconds. Cache and reuse the token until it expires to minimize network latency impact. |
| `scope`                 | A list of scopes issued in the access token.                                                                         |

See the [Maskinporten token documentation](https://docs.digdir.no/docs/Maskinporten/maskinporten_protocol_token) for more details.

### 3. Consume API

Once you have acquired the token, you can finally consume the external API.

Use the token in the `Authorization` header as a [Bearer token](../../../auth/explanations/README.md#bearer-token):

```http
GET /resource HTTP/1.1

Host: api.example.com
Authorization: Bearer eyJraWQ...
```

Success!
