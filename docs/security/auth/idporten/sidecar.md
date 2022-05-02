---
description: Reverse-proxy that handles automatic authentication and login/logout flows for ID-porten.
---

# ID-porten sidecar

!!! warning "Status: Beta"
    This feature is only available in the [GCP clusters](../../../clusters/gcp.md).

    **Experimental**: users report that this component is working, but it needs a broader audience to be battle-tested properly.

    Report any issues to the #nais channel on Slack.

## Description

A reverse proxy that provides functionality to handle ID-porten login and logout.

!!! info "Prerequisites"
    - [x] Ensure that you first [enable ID-porten for your application](README.md).
    - [x] Ensure that you define an [ingress](../../../nais-application/application.md#ingresses) for your application.
    - [x] Ensure that the ingress is on the correct domain:
        - `dev.nav.no` for the [_development_ clusters](../../../clusters/gcp.md#dev-gcp-ingresses)
        - `nav.no` for the [_production_ clusters](../../../clusters/gcp.md#prod-gcp-ingresses)

## Spec

!!! danger "Port Configuration"
    The sidecar will occupy and use the ports `7564` and `7565`.

    Ensure that you do **not** bind to these ports from your application as they will be overridden.

=== "nais.yaml"
    ```yaml
    spec:
      idporten:
        sidecar:
          enabled: true

          # everything below is optional, defaults shown
          level: Level4
          locale: nb
          autoLogin: false
          errorPath: ""
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
| :---- | :---------------- |
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

!!! danger
    **Your application should secure its own endpoints.** That is, deny access to sensitive endpoints if the appropriate authentication is not supplied.

Your application should also [validate the claims and signature](../concepts/tokens.md#token-validation) for the ID-porten JWT `access_token` attached by the sidecar.

#### Audience

Note that the `aud` claim is _not_ set for ID-porten access tokens.
You should instead validate that the `client_id` claim has a value equal to your [own ID-porten client ID](README.md#idporten_client_id).

#### Security Level

Validate that the `acr` claim exists and that the set level matches the minimum [security level](#security-levels) for your endpoints:

* If your endpoint(s) accepts a minimum of `Level3` authentication, you must also accept `Level4`.
* The inverse should be rejected. That is, applications expecting `Level4` authentication should _NOT_ accept tokens with `acr=Level3`.
