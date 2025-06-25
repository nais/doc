{% set endpoint_env_var = 'NAIS_TOKEN_EXCHANGE_ENDPOINT' %}
{% include 'auth/partials/texas-header.md' %}

| Parameter           | Example Value           | Description                                                                                                                                         |
|:--------------------|:------------------------|:----------------------------------------------------------------------------------------------------------------------------------------------------|
| `identity_provider` | `<<identity_provider>>` | Always `<<identity_provider>>`.                                                                                                                     |
| `target`            | `<<target>>`            | The intended _audience_ (target API or recipient) of the new token.                                                                                 |
| `user_token`        | `eyJra...`              | The user's access token from the inbound request. Token that should be exchanged.                                                                   |

=== "application/json"

    ```http title="Token request"
    POST ${<<endpoint_env_var>>} HTTP/1.1
    Content-Type: application/json

    {
        "identity_provider": "<<identity_provider>>",
        "target": "<<target>>",
        "user_token": "eyJra..."
    }
    ```

=== "application/x-www-form-urlencoded"

    ```http title="Token request"
    POST ${<<endpoint_env_var>>} HTTP/1.1
    Content-Type: application/x-www-form-urlencoded

    identity_provider=<<identity_provider>>&
    target=<<target>>&
    user_token=eyJra...
    ```

{% include 'auth/partials/texas-footer.md' %}
