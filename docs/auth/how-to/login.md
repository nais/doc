---
tags: [auth, login, how-to]
---

# Log in users

This guide shows you how to log in users to your application with the [login proxy](../explanations/README.md#login-proxy).

{%- if tenant() == "nav" %}

!!! warning "The instructions on this page are for advanced use cases"

    For most cases, you will want to use ID-porten or Entra ID directly:

    - To log in a citizen, see the :dart: [guide to logging in with ID-porten](../idporten/how-to/login.md)
    - To log in an employee, see the :dart: [guide to logging in with Entra ID](../entra-id/how-to/login.md)

    If you need to log in users with a generic OpenID Connect identity provider instead, follow the instructions below.

{%- endif %}

## Prerequisites

- Your application is [exposed to the appropriate audience](../../workloads/application/how-to/expose.md).
- You have a client ID and either a client secret or private key for a client registered at an OpenID Connect identity provider.

## Configure the secret

1. [Create a secret](../../services/secrets/how-to/console.md) for your team with the following naming format

    ```
    login-config-<application-name>
    ```

2. Add the following keys:

    `WONDERWALL_OPENID_CLIENT_ID`

    :   The client ID for your application.

    `WONDERWALL_OPENID_WELL_KNOWN_URL`

    :   Optional. Only required of your organization doesn't set a default value, or if you need to override the default value.<br/><br/>
        The well-known URL for the OpenID Connect provider, e.g. `https://<provider>/well-known/openid-configuration`.

3. Add one of the following keys:

    `WONDERWALL_OPENID_CLIENT_JWK`

    :   This is a private key in JWK format, e.g. `{"kty":"RSA","e":"AQAB","kid":"my-key-id",...}`.

    `WONDERWALL_OPENID_CLIENT_SECRET`

    :   The client secret for your application.

4. Optionally, add additional environment variables to the secret to configure the login proxy further.
See the [Wonderwall configuration reference :octicons-link-external-16:](https://github.com/nais/wonderwall/blob/master/docs/configuration.md) for all available options.

## Configure your application

Enable the proxy in your application configuration:

```yaml title="app.yaml"
spec:
  login:
    provider: openid
```

To enforce authentication for all requests, add the following configuration:

```yaml title="app.yaml" hl_lines="4-5"
spec:
  login:
    provider: openid
    enforce:
      enabled: true
```

See the [Nais application reference](../../workloads/application/reference/application-spec.md#login) for the complete specifications with all possible options.

Now that your application is configured, you should handle inbound requests in your application code.

## Handle inbound requests

As long as the user is authenticated, the `Authorization` header includes their `access_token` as a Bearer token.
Read more about the request flow under [explanations/#login-proxy](../explanations/#login-proxy).

Your application is responsible for verifying that this token is present and valid. To do so, follow these steps:

### Handle missing or empty `Authorization` header

If the `Authorization` header is missing or empty, the user is unauthenticated.

Return an appropriate HTTP status code to the frontend, and redirect the user agent to the [login endpoint]:

```
https://<ingress>/oauth2/login
```

### Validate token in `Authorization` header

If the `Authorization` header is present, validate the Bearer token within.
If invalid, redirect the user to the login endpoint:

```
https://<ingress>/oauth2/login
```

## Related pages

:bulb: [Learn more about the login proxy](../explanations/README.md#login-proxy).

:books: See [Login proxy reference](../reference/README.md#login-proxy) for technical details.

[login endpoint]: ../reference/README.md#login-endpoint
