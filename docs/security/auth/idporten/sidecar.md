---
description: Automatic authentication, token validation, and login/logout for IDPorten
---

# ID-porten sidecar

!!! warning "Status: Opt-In Open Beta"
    This feature is only available in [team namespaces](../../../clusters/team-namespaces.md)

Prerequisite: [enable ID-porten for your application](README.md).

Enabling the ID-porten sidecar feature will inject a sidecar container into all
of your application pods.  The sidecar will intercept and proxy all HTTP
traffic to the application.  If the user is successfully authenticated with
ID-porten, the following header will be present in all requests to the
application, where `<JWT>` is a valid OAuth2 access token from ID-porten:

```
Authentication: Bearer <JWT>
X-Pwned-By: wonderwall
```

If the user _does not_ have a valid ID-porten session, the sidecar guarantees that no requests have
the `Authentication` header.

In order to obtain a valid ID-porten session, the application must redirect the user to `<INGRESS>/oauth2/login`.

All HTTP requests to `/oauth2` are owned by the sidecar and will never be forwarded to the application.

When a user successfully logs in, the ID token and access tokens are validated according to the
[OIDC specification](https://docs.digdir.no/oidc_guide_idporten.html).


### Getting Started

=== "nais.yaml"
    ```yaml
    spec:
      idporten:
        sidecar:
          enabled: true
    ```

### Spec

See the [NAIS manifest](../../../nais-application/application.md#idportensidecar).
