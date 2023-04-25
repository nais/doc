---
description: Reverse-proxy that handles automatic authentication and login/logout flow public-facing authentication using ID-porten.
---

# ID-porten

[ID-porten](https://docs.digdir.no/docs/idporten/) is a common log-in system used for logging into Norwegian public e-services for citizens.

NAIS provides a _sidecar_[^1] that integrates with ID-porten, so that you can easily and securely log in and authenticate citizen end-users.

!!! warning "Availability"
    This feature is only available in **dev-gcp** and **prod-gcp**.

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
    ```

See the [NAIS manifest reference](../../nais-application/application.md#idportensidecar) for the complete specification.

Ensure that you also define at least one [ingress](../../nais-application/application.md#ingresses) for your application.

### Access Policies

ID-porten is an external service.
[External services are not reachable by default](../../nais-application/access-policy.md#external-services), unless explicitly defined through an access policy.

Any host needed to reach ID-porten is automatically set up, so you do **not** need to explicitly configure these.

## Usage

Try out a basic user flow:

1. Visit your application's login endpoint (`https://<ingress>/oauth2/login`) to trigger a login.
2. After logging in, you should be redirected back to your application.
3. All further requests to your application should now have an `Authorization` header with the user's access token as a [Bearer token](concepts/tokens.md#bearer-token)
4. Visit your application's logout endpoint (`https://<ingress>/oauth2/logout`) to trigger a logout.
5. You will be redirected to ID-porten for logout, and then back to a preconfigured logout page.
6. Success!

**See [Wonderwall](../../appendix/wonderwall.md) for further details.**

### Runtime Variables & Credentials

The following environment variables and files (under the directory `/var/run/secrets/nais.io/idporten/`) are available at runtime:

| Name                      | Description                                                                                                         |
|:--------------------------|:--------------------------------------------------------------------------------------------------------------------|
| `IDPORTEN_AUDIENCE`       | The expected [audience](concepts/tokens.md#token-validation) for access tokens from ID-porten.                   |
| `IDPORTEN_CLIENT_ID`      | [Client ID](concepts/actors.md#client-id) that uniquely identifies the application in ID-porten.                 |
| `IDPORTEN_WELL_KNOWN_URL` | The URL for ID-porten's [OIDC metadata discovery document](concepts/actors.md#well-known-url-metadata-document). |
| `IDPORTEN_ISSUER`         | `issuer` from the [metadata discovery document](concepts/actors.md#issuer).                                      |
| `IDPORTEN_JWKS_URI`       | `jwks_uri` from the [metadata discovery document](concepts/actors.md#jwks-endpoint-public-keys).                 |

These variables are needed for token validation.

### Token Validation

!!! danger "Secure your endpoints"
    **Your application is responsible for securing its own endpoints.**

    - If a request does not contain an `Authorization` header, the request should be considered unauthenticated and access should be denied.
    - If a request has an `Authorization` header that contains a [JWT], the token must be validated before access is granted.

Your application should [validate the claims and signature](concepts/tokens.md#token-validation)
for the JWT Bearer `access_token` attached by the sidecar in the `Authorization` header.

#### Audience

Note that the `aud` claim should be equal to the `IDPORTEN_AUDIENCE` environment variable mentioned earlier.

You should also validate that the `client_id` claim has a value equal to the value of the `IDPORTEN_CLIENT_ID` environment variable.

#### Security Level

Validate that the `acr` claim exists and that the set level matches the minimum [security level](#security-levels) for your endpoints:

* If your endpoint(s) accepts a minimum of `Level3` authentication, you must also accept `Level4`.
* The inverse should be rejected. That is, applications expecting `Level4` authentication should _NOT_ accept tokens with `acr=Level3`.

### Security Levels

ID-porten supports [different levels of security](https://eid.difi.no/en/security-and-cookies/different-levels-security)
when authenticating users.

Valid values are `Level3` or `Level4`.

You can set a default value for _all_ requests by specifying [`spec.idporten.sidecar.level`](../../nais-application/application.md#idportensidecarlevel).
**If unspecified, the sidecar will use `Level4` as the default value.**

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

You can set a default value for _all_ requests by specifying [`spec.idporten.sidecar.locale`](../../nais-application/application.md#idportensidecarlocale).
**If unspecified, the sidecar will use `nb` as the default value.**

For runtime control of the value, set the query parameter `locale` when redirecting the user to login:

```
https://<ingress>/oauth2/login?locale=en
```

## Next Steps

The access token provided by the sidecar should only be accepted and used by your application.

In order to access other applications, you should exchange the token in order to get a new token that is correctly scoped to access a given application.

For ID-porten, use the [token exchange grant (TokenX)](concepts/protocols.md#token-exchange-grant) to do this.

[JWT]: concepts/tokens.md#jwt
[^1]: A sidecar is an additional container that runs alongside your application in the same Kubernetes [_Pod_](https://kubernetes.io/docs/concepts/workloads/pods/).
