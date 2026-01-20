---
tags: [maskinporten, how-to]
conditional: [tenant, nav]
---

# Consume external API using Maskinporten

This how-to guides you through the steps required to consume an API secured with [Maskinporten](../README.md):

## Configure your application

Declare all the scopes that you want to consume in your application's Nais manifest so that your application is granted access to them:

```yaml hl_lines="5-7" title="app.yaml"
spec:
  maskinporten:
    enabled: true
    scopes:
      consumes:
        - name: "skatt:some.scope"
        - name: "nav:some/other/scope"
```

???+ warning "Maskinporten configuration changes are eventually consistent"

    Changes to the Maskinporten configuration may take up to 15 minutes to propagate.

    If you're experiencing issues with access to these scopes, wait a few minutes before trying again.

The scopes themselves are defined and owned by the external API provider. The exact scope values must be exchanged out-of-band.

{%- if tenant() == "nav" %}
???+ warning "Ensure that organization has access to scopes"

    Make sure that the provider has granted NAV (organization number `889640782`) access to any scopes that you wish to consume.

    Provisioning of client will fail otherwise.

{%- endif %}

Finally, [configure appropriate outbound access policies](../../../workloads/explanations/zero-trust.md#outbound-traffic) to access the external API endpoints:

```yaml hl_lines="5" title="app.yaml"
spec:
  accessPolicy:
    outbound:
      external:
        - host: api.example.com
```

## Acquire token

{% set identity_provider = 'maskinporten' %}
{% set target = 'example:some.scope' %}
{% set target_description = 'Whitespace-separated list of scopes that you want in the issued token from Maskinporten.' %}
{% include 'auth/partials/token.md' %}

### Audience-restricted tokens

If the API provider requires the use of an [audience-restricted token](https://docs.digdir.no/maskinporten_func_audience_restricted_tokens.html), you must also include the following parameter in the request:

| Parameter    | Example Value                       | Description                                                                                                                                 |
|:-------------|:------------------------------------|:--------------------------------------------------------------------------------------------------------------------------------------------|
| `resource`   | `https://some-provider.example/api` | Optional. Target audience for the token returned by Maskinporten. The exact value is defined by the API provider and exchanged out-of-band. |

=== "application/json"

    ```http title="Token request"
    POST ${NAIS_TOKEN_ENDPOINT} HTTP/1.1
    Content-Type: application/json

    {
        "identity_provider": "maskinporten",
        "target": "example:some.scope",
        "resource": "https://some-provider.example/api"
    }
    ```

=== "application/x-www-form-urlencoded"

    ```http title="Token request"
    POST ${NAIS_TOKEN_ENDPOINT} HTTP/1.1
    Content-Type: application/x-www-form-urlencoded

    identity_provider=maskinporten&
    target=example:some.scope&
    resource=https://some-provider.example/api
    ```

### Rich authorization requests (RAR)

If the API provider requires the use of an [rich authorization requests (RAR)](https://docs.digdir.no/docs/Maskinporten/maskinporten_func_systembruker.html), you must also include the following parameter in the request:

| Parameter               | Example Value                              | Description                                                                                                                                                                                                                                                                                     |
|:------------------------|:-------------------------------------------|:------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `authorization_details` | `[{"type": "urn:altinn:systemuser", ...}]` | Optional. Must be a JSON array of objects. The entire value is passed through as `authorization_details` to the identity provider. See the [Maskinporten system user documentation](https://docs.digdir.no/docs/Maskinporten/maskinporten_func_systembruker.html#foresp%C3%B8rsel) for details. |

=== "application/json"

    ```http title="Token request"
    POST ${NAIS_TOKEN_ENDPOINT} HTTP/1.1
    Content-Type: application/json

    {
        "identity_provider": "maskinporten",
        "target": "example:some.scope",
        "authorization_details": [{"type": "urn:altinn:systemuser", ...}]
    }
    ```

=== "application/x-www-form-urlencoded"

    ```http title="Token request"
    POST ${NAIS_TOKEN_ENDPOINT} HTTP/1.1
    Content-Type: application/x-www-form-urlencoded

    identity_provider=maskinporten&
    target=example:some.scope&
    authorization_details=[{"type":"urn:altinn:systemuser",...}]
    ```

## Consume API

Once you have acquired a new token, you can finally consume the external API by using the token as a [Bearer token](../../explanations/README.md#bearer-token):

```http
GET /resource HTTP/1.1

Host: api.example.com
Authorization: Bearer eyJraWQ...
```
