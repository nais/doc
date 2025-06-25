The steps below describe how to validate a token using the _token introspection endpoint_.

???+ question "What is the token introspection endpoint?"

    The token introspection endpoint simplifies the token validation process, but does require a network call.
    
    If your application uses a library or framework that supports validering JWTs, you can alternatively let these handle the validation instead.
    See [the reference page for manually validating tokens](<<token_validation_reference>>).

{% set endpoint_env_var = 'NAIS_TOKEN_INTROSPECTION_ENDPOINT' %}
{% include 'auth/partials/texas-header.md' %}

| Parameter           | Example Value           | Description                            |
|:--------------------|:------------------------|:---------------------------------------|
| `identity_provider` | `<<identity_provider>>` | Always `<<identity_provider>>`.        |
| `token`             | `eyJra...`              | The access token you wish to validate. |

=== "application/json"

    ```http title="Token request"
    POST ${<<endpoint_env_var>>} HTTP/1.1
    Content-Type: application/json

    {
        "identity_provider": "<<identity_provider>>",
        "token": "eyJra..."
    }
    ```

=== "application/x-www-form-urlencoded"

    ```http title="Token request"
    POST ${<<endpoint_env_var>>} HTTP/1.1
    Content-Type: application/x-www-form-urlencoded

    identity_provider=<<identity_provider>>&
    token=eyJra...
    ```

The response is always a HTTP 200 OK response with a JSON body.

It always contains the `active` field, which is a boolean value that indicates whether the token is valid or not.

##### Success response

If the token is valid, the response will additionally contain **all** the token's claims:

```json title="Valid token"
{
    "active": true,
    "exp": 1730980893,
    "iat": 1730977293,
    ...
}
```

Claims are copied verbatim from the token to the response.

???+ question "Which claims are validated by the endpoint?"

    The endpoint only validates the token's signature and its [standard claims](../../explanations/README.md#claims-validation).

    [Other claims](<<claims_reference>>) are included in the response, but are not validated.
    Your application must validate these other claims according to your own requirements.

##### Error response

If the token is invalid, the only additional field in the response is the `error` field:

```json title="Invalid token"
{
    "active": false,
    "error": "token is expired"
}
```

The `error` field contains a human-readable error message that describes why the token is invalid.
