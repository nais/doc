---
description: Reverse-proxy that handles automatic authentication and login/logout flow public-facing authentication using ID-porten.
---

# ID-porten

[ID-porten](https://docs.digdir.no/docs/idporten/) is a common log-in system used for logging into Norwegian public e-services for citizens.

NAIS provides a _sidecar_[^1] that integrates with ID-porten, so that you can easily and securely log in and authenticate citizen end-users.

!!! warning "Availability"
    The sidecar is only available in the [Google Cloud Platform](../../clusters/gcp.md) clusters.

## Spec

!!! danger "Port Configuration"
    The sidecar will occupy and use the ports `7564` and `7565`.

    Ensure that you do **not** bind to these ports from your application as they will be overridden.

Minimal example:

=== "nais.yaml"
    ```yaml
    spec:
      idporten:
        enabled: true
        sidecar:
          enabled: true
          level: Level4  # optional, default value shown
          locale: nb     # optional, default value shown
    ```

See the [NAIS manifest reference](../../nais-application/application.md#idportensidecar) for the complete specification.

Ensure that you also define at least one [ingress](../../nais-application/application.md#ingresses) for your application.

## Network Connectivity

ID-porten is an [external service](../../nais-application/access-policy.md#external-services).
Outbound access to the ID-porten hosts is automatically configured by the platform.

You do _not_ have to explicitly configure outbound access to ID-porten yourselves when using the sidecar.

## Usage

Try out a basic user flow:

1. Visit your application's login endpoint (`https://<ingress>/oauth2/login`) to trigger a login.
2. After logging in, you should be redirected back to your application.
3. All further requests to your application should now have an `Authorization` header with the user's access token as a [Bearer token](concepts/tokens.md#bearer-token)
4. Visit your application's logout endpoint (`https://<ingress>/oauth2/logout`) to trigger a logout.
5. You will be redirected to ID-porten for logout, and then back to a preconfigured logout page.
6. Success!

**See [Wonderwall](../../addons/wonderwall.md#usage) for further usage details.**

### Runtime Variables & Credentials

Your application will automatically be injected with both environment variables and files at runtime.
You can use whichever is most convenient for your application.

The files are available at the following path: `/var/run/secrets/nais.io/idporten/`

| Name                      | Description                                                                                                      |
|:--------------------------|:-----------------------------------------------------------------------------------------------------------------|
| `IDPORTEN_AUDIENCE`       | The expected [audience](concepts/tokens.md#token-validation) for access tokens from ID-porten.                   |
| `IDPORTEN_WELL_KNOWN_URL` | The URL for ID-porten's [OIDC metadata discovery document](concepts/actors.md#well-known-url-metadata-document). |
| `IDPORTEN_ISSUER`         | `issuer` from the [metadata discovery document](concepts/actors.md#issuer).                                      |
| `IDPORTEN_JWKS_URI`       | `jwks_uri` from the [metadata discovery document](concepts/actors.md#jwks-endpoint-public-keys).                 |

These variables are used for [token validation](#token-validation).

### Security Levels

ID-porten classifies different user authentication methods into [security levels of assurance](https://docs.digdir.no/docs/idporten/oidc/oidc_protocol_id_token#acr-values).
This is reflected in the `acr` claim for the user's JWTs issued by ID-porten.

Valid values, in increasing order of assurance levels:

| Old Value (deprecated) | New Value                  | Description                                                      |
|:-----------------------|----------------------------|:-----------------------------------------------------------------|
| `Level3`               | `idporten-loa-substantial` | a substantial level of assurance, e.g. MinID                     |
| `Level4`               | `idporten-loa-high`        | a high level of assurance, e.g. BankID, Buypass, Commfides, etc. |

!!! warning "2023: New `acr` values for ID-porten"

    ID-porten is changing the values for the `acr` claim in 2023, as seen in the table above.

    The sidecar accepts both the old and new values to ease migration, though you should use the newer values when possible.

    If your application uses the `acr` claim found in the JWT in any way, ensure that it accepts both old and new values.

To configure a default value for _all_ login requests:

=== "nais.yaml"
    ```yaml hl_lines="6"
    spec:
      idporten:
        enabled: true
        sidecar:
          enabled: true
          level: Level4
    ```

**If unspecified, the sidecar will use `Level4` as the default value.**

The sidecar will also validate and enforce that the user's current authenticated session has a level that **matches or exceeds** the application's configured level.
The user's session is marked as unauthenticated if the level is _lower_ than the configured level.

Example:

* If the application requires `Level3` authentication, the sidecar will allow sessions with `Level4`.
* The inverse is rejected. That is, applications expecting `Level4` authentication will have the sidecar mark sessions at `acr=Level3` as unauthenticated.

For runtime control of the value, set the query parameter `level` when redirecting the user to login:

```
https://<ingress>/oauth2/login?level=Level4
```

### Locales

ID-porten supports a few different locales for the user interface during authentication.

Valid values shown below:

| Value | Description       |
|:------|:------------------|
| `nb`  | Norwegian Bokmål  |
| `nn`  | Norwegian Nynorsk |
| `en`  | English           |
| `se`  | Sámi              |

To configure a default value for _all_ requests:

=== "nais.yaml"
    ```yaml hl_lines="6"
    spec:
      idporten:
        enabled: true
        sidecar:
          enabled: true
          locale: en
    ```

**If unspecified, the sidecar will use `nb` as the default value.**

For runtime control of the value, set the query parameter `locale` when redirecting the user to login:

```
https://<ingress>/oauth2/login?locale=en
```

## Token Validation

!!! danger "Secure your endpoints"
    **Your application is responsible for securing its own endpoints.**

    - If a request does not contain an `Authorization` header, the request should be considered unauthenticated and access should be denied.
    - If a request has an `Authorization` header that contains a [JWT], the token must be validated before access is granted.

Your application should [validate the standard claims and signature](concepts/tokens.md#token-validation)
for the JWT Bearer `access_token` attached by the sidecar in the `Authorization` header.

In addition to the standard time and expiry claim validations, the following validations should be performed:

#### Issuer Validation

Validate that the `iss` claim has a value that is equal to either:

1. the `IDPORTEN_ISSUER` [environment variable](#runtime-variables-credentials), or
2. the `issuer` property from the [metadata discovery document](concepts/actors.md#well-known-url-metadata-document).
    The document is found at the endpoint pointed to by the `IDPORTEN_WELL_KNOWN_URL` environment variable.

#### Audience Validation

Validate that the `aud` claim is equal to the `IDPORTEN_AUDIENCE` environment variable.

#### Signature Validation

Validate that the token is signed with a public key published at the JWKS endpoint.
This endpoint URI can be found in one of two ways:

1. the `IDPORTEN_JWKS_URI` environment variable, or
2. the `jwks_uri` property from the metadata discovery document.
    The document is found at the endpoint pointed to by the `IDPORTEN_WELL_KNOWN_URL` environment variable.

### Other Token Claims

List of other notable claims for access tokens from ID-porten that can optionally be used or validated:

- `acr` (**Authentication Context Class Reference**)
    - The [security level](#security-levels) used for authenticating the end-user.
- `pid` (**personidentifikator**)
    - The Norwegian national ID number (fødselsnummer/d-nummer) of the authenticated end user.

For a complete list of claims, see <https://docs.digdir.no/docs/idporten/oidc/oidc_protocol_access_token>.

## Next Steps

The access token provided by the sidecar should only be accepted and used by your application.

In order to access other applications, you should exchange the token in order to get a new token that is correctly scoped to access a given application.

For ID-porten, use the [token exchange grant (TokenX)](tokenx.md#exchanging-a-token) to do this.

[JWT]: concepts/tokens.md#jwt
[^1]: A sidecar is an additional container that runs alongside your application in the same Kubernetes [_Pod_](https://kubernetes.io/docs/concepts/workloads/pods/).
