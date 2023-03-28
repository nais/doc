---
description: Reverse-proxy that handles automatic authentication and login/logout flows for ID-porten.
---

# ID-porten sidecar

!!! warning "Availability"
    This feature is only available in **dev-gcp** and **prod-gcp**.

## Description

A reverse proxy that provides functionality to handle ID-porten login and logout.

!!! info "Prerequisites"
    - Ensure that you first [enable ID-porten for your application](README.md).
    - Ensure that you define at least one [ingress](../../../nais-application/application.md#ingresses) for your application.
    - Ensure that the _first_ ingress is on the correct domain:
        - `[ekstern.]dev.nav.no` for the [_development_ clusters](../../../clusters/gcp.md#dev-gcp-ingresses)
        - `nav.no` for the [_production_ clusters](../../../clusters/gcp.md#prod-gcp-ingresses)

## Spec

!!! danger "Port Configuration"
    The sidecar will occupy and use the ports `7564` and `7565`.

    Ensure that you do **not** bind to these ports from your application as they will be overridden.

=== "nais.yaml"
    ```yaml
    spec:
      idporten:
        enabled: true
        sidecar:
          enabled: true

          # everything below is optional, defaults shown
          level: Level4
          locale: nb
          autoLogin: false
    ```

See the [NAIS manifest](../../../nais-application/application.md#idportensidecar) for details.

## Usage

!!! tip
    See the [Wonderwall](../../../appendix/wonderwall.md) appendix for usage details.

### Security Levels

ID-porten supports [different levels of security](https://eid.difi.no/en/security-and-cookies/different-levels-security)
when authenticating users. 
This is sent by the sidecar as the `acr_values` parameter to the [`/authorize` endpoint](https://docs.digdir.no/oidc_protocol_authorize.html).

Valid values are `Level3` or `Level4`.

You can set a default value for _all_ requests by specifying [`spec.idporten.sidecar.level`](../../../nais-application/application.md#idportensidecarlevel). 
**If unspecified, the sidecar will use `Level4` as the default value.**

For runtime control of the value, set the query parameter `level` when redirecting the user to login:

```
https://<ingress>/oauth2/login?level=Level4
```

### Locales

ID-porten supports a few different locales for the user interface during authentication. 
This is sent by the sidecar as the `ui_locales` parameter to the [`/authorize` endpoint](https://docs.digdir.no/oidc_protocol_authorize.html).

Valid values shown below:

| Value | Description       |
|:------|:------------------|
| `nb`  | Norwegian Bokmål  |
| `nn`  | Norwegian Nynorsk |
| `en`  | English           |
| `se`  | Sámi              |

You can set a default value for _all_ requests by specifying [`spec.idporten.sidecar.locale`](../../../nais-application/application.md#idportensidecarlocale).
**If unspecified, the sidecar will use `nb` as the default value.**

For runtime control of the value, set the query parameter `locale` when redirecting the user to login:

```
https://<ingress>/oauth2/login?locale=en
```

### Token Validation

!!! danger "Secure your endpoints"
    **Your application is responsible for securing its own endpoints.**

    - If a request does not contain an `Authorization` header, the request should be considered unauthenticated and access should be denied.
    - If a request has an `Authorization` header that contains a [JWT], the token must be validated before access is granted.

Your application should [validate the claims and signature](../concepts/tokens.md#token-validation)
for the JWT Bearer `access_token` attached by the sidecar in the `Authorization` header.

#### Audience

Note that the `aud` claim is _not_ set for ID-porten access tokens.
You should instead validate that the `client_id` claim has a value equal to your [own ID-porten client ID](README.md#idporten_client_id).

#### Security Level

Validate that the `acr` claim exists and that the set level matches the minimum [security level](#security-levels) for your endpoints:

* If your endpoint(s) accepts a minimum of `Level3` authentication, you must also accept `Level4`.
* The inverse should be rejected. That is, applications expecting `Level4` authentication should _NOT_ accept tokens with `acr=Level3`.

## Next Steps

The access token that Wonderwall provides should only be accepted and used by your application.

In order to access other applications, you should exchange the token in order to get a new token that is correctly scoped to access a given application.

For ID-porten, use the [token exchange grant](../concepts/protocols.md#token-exchange-grant) to do this.

[JWT]: ../concepts/tokens.md#jwt
