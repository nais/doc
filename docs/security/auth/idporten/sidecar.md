---
description: Automatic authentication, token validation, and login/logout for IDPorten
---

# ID-porten sidecar

!!! warning "Status: Alpha"
    This feature is only available in [team namespaces](../../../clusters/team-namespaces.md)

## Description

Automatic handling of ID-porten login, callback, logout, and front channel logout.

Prerequisite: [enable ID-porten for your application](README.md).

All HTTP requests to the application will be intercepted by a sidecar ("wonderwall"), and checked for valid ID-porten credentials.
When a user successfully logs in, the ID and access tokens are validated according to the
[OIDC specification](https://docs.digdir.no/oidc_guide_idporten.html).
If the tokens are valid, an `Authentication` header is added to the request, which is then forwarded to the application container.

```
Authentication: Bearer JWT_ACCESS_TOKEN
X-Pwned-By: wonderwall
```

## Notes

* The ID-porten access token can be exchanged for a TokenX token.
* The `Authentication` header is removed from the original request if the user _does not_ have a valid ID-porten session.
* When you must authenticate a user, redirect to `https://app.ingress/oauth2/login`.
* All HTTP requests to `/oauth2` are owned by the sidecar and will never be forwarded to the application.

The sidecar provides these endpoints under `https://app.ingress`:

* `/oauth2/login` redirects the user to ID-porten.
* `/oauth2/callback` retrieves and validates ID-porten tokens.
* `/oauth2/logout` logs out the user globally.
* `/oauth2/logout/frontchannel` implements front channel logout.

## Spec

=== "nais.yaml"
    ```yaml
    spec:
      idporten:
        sidecar:
          enabled: true
    ```

See the [NAIS manifest](../../../nais-application/application.md#idportensidecar).
