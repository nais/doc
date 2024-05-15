---
description: Reverse-proxy that handles automatic authentication and login/logout flow public-facing authentication using ID-porten.
---

# ID-porten

[ID-porten](https://docs.digdir.no/docs/idporten/) is a common log-in system used for logging into Norwegian public e-services for citizens.

NAIS provides a _sidecar_ that integrates with ID-porten, so that you can easily and securely log in and authenticate citizen end-users.

!!! warning "Availability"
    The sidecar is only available in the [Google Cloud Platform](../../reference/environments.md#google-cloud-platform-gcp) clusters.

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
          level: idporten-loa-high  # optional, default value shown
          locale: nb                # optional, default value shown
    ```

See the [NAIS manifest reference](../../reference/application-spec.md#idportensidecar) for the complete specification.

Ensure that you also define at least one [ingress](../../reference/application-spec.md#ingresses) for your application.

## Network Connectivity

ID-porten is an external service.
Outbound access to the ID-porten hosts is automatically configured by the platform.

You do _not_ have to explicitly configure outbound access to ID-porten yourselves when using the sidecar.

## Usage

Try out a basic user flow:

1. Visit your application's login endpoint (`https://<ingress>/oauth2/login`) to trigger a login.
2. After logging in, you should be redirected back to your application.
3. All further requests to your application should now have an `Authorization` header with the user's access token as a [Bearer token](concepts.md#bearer-token)
4. Visit your application's logout endpoint (`https://<ingress>/oauth2/logout`) to trigger a logout.
5. You will be redirected to ID-porten for logout, and then back to a preconfigured logout page.
6. Success!

**See [Wonderwall](wonderwall.md#usage) for further usage details.**

### Runtime Variables & Credentials

Your application will automatically be injected with both environment variables and files at runtime.
You can use whichever is most convenient for your application.

The files are available at the following path: `/var/run/secrets/nais.io/idporten/`

| Name                      | Description                                                                                                   |
|:--------------------------|:--------------------------------------------------------------------------------------------------------------|
| `IDPORTEN_AUDIENCE`       | The expected [audience](concepts.md#token-validation) for access tokens from ID-porten.                       |
| `IDPORTEN_WELL_KNOWN_URL` | The URL for ID-porten's [OIDC metadata discovery document](concepts.md#well-known-url-metadata-document).     |
| `IDPORTEN_ISSUER`         | `issuer` from the [metadata discovery document](concepts.md#issuer).                                          |
| `IDPORTEN_JWKS_URI`       | `jwks_uri` from the [metadata discovery document](concepts.md#jwks-endpoint-public-keys).                     |

These variables are used for [token validation](#token-validation).

### Security Levels

ID-porten classifies different user authentication methods into [security levels of assurance](https://docs.digdir.no/docs/idporten/oidc/oidc_protocol_id_token#acr-values).
This is reflected in the `acr` claim for the user's JWTs issued by ID-porten.

Valid values, in increasing order of assurance levels:

| Value                      | Description                                                      | Notes                  |
|:---------------------------|:-----------------------------------------------------------------|:-----------------------|
| `idporten-loa-substantial` | a substantial level of assurance, e.g. MinID                     | Also known as `Level3` |
| `idporten-loa-high`        | a high level of assurance, e.g. BankID, Buypass, Commfides, etc. | Also known as `Level4` |

To configure a default value for _all_ login requests:

=== "nais.yaml"
    ```yaml hl_lines="6"
    spec:
      idporten:
        enabled: true
        sidecar:
          enabled: true
          level: idporten-loa-high
    ```

**If unspecified, the sidecar will use `idporten-loa-high` as the default value.**

The sidecar automatically validates and enforces the user's authentication level **matches or exceeds** the application's configured level.
The user's session is marked as unauthenticated if the level is _lower_ than the configured level.

Example:

* If the application requires authentication on the `idporten-loa-substantial` level, the sidecar will allow sessions with a level of `idporten-loa-high`.
* The inverse is rejected. That is, applications expecting `idporten-loa-high` authentication will have the sidecar mark sessions at `acr=idporten-loa-substantial` as unauthenticated.

For runtime control of the value, set the query parameter `level` when redirecting the user to login:

```
https://<ingress>/oauth2/login?level=idporten-loa-high
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

The sidecar attaches an `Authorization` header with the user's `access_token` as a [Bearer token](concepts.md#bearer-token), as long as the user is authenticated.

It is your responsibility to **validate the token** before granting access to resources.

For any endpoint that requires authentication; **deny access** if the request does not contain a valid Bearer token.

Always validate the [signature and standard time-related claims](concepts.md#token-validation).
Additionally, perform the following validations:

**Issuer Validation**

Validate that the `iss` claim has a value that is equal to either:

1. the `IDPORTEN_ISSUER` [environment variable](#runtime-variables-credentials), or
2. the `issuer` property from the [metadata discovery document](concepts.md#well-known-url-metadata-document).
    The document is found at the endpoint pointed to by the `IDPORTEN_WELL_KNOWN_URL` environment variable.

**Audience Validation**

Validate that the `aud` claim is equal to the `IDPORTEN_AUDIENCE` environment variable.

**Signature Validation**

Validate that the token is signed with a public key published at the JWKS endpoint.
This endpoint URI can be found in one of two ways:

1. the `IDPORTEN_JWKS_URI` environment variable, or
2. the `jwks_uri` property from the metadata discovery document.
    The document is found at the endpoint pointed to by the `IDPORTEN_WELL_KNOWN_URL` environment variable.

### Other Token Claims

Other claims may be present in the token.
Validation of these claims is optional.

Notable claims:

- `acr` (**Authentication Context Class Reference**)
    - The [security level](#security-levels) used for authenticating the end-user.
- `pid` (**personidentifikator**)
    - The Norwegian national ID number (fødselsnummer/d-nummer) of the authenticated end user.

For a complete list of claims, see the [Access Token Reference in ID-porten](https://docs.digdir.no/docs/idporten/oidc/oidc_protocol_access_token#by-value--self-contained-access-token).

## Next Steps

The access token provided by the sidecar should only be accepted and used by your application.

To access other applications, you need a token scoped to the target application.

For ID-porten, use the [token exchange grant (TokenX)](tokenx.md#exchanging-a-token) to exchange the token for a new token.

!!! tip "Recommended: JavaScript Library"

    See <https://github.com/navikt/oasis> for an opinionated JavaScript library for token validation and exchange.
