{% set endpoint_env_var = 'NAIS_TOKEN_ENDPOINT' %}
{% include 'auth/partials/texas-header.md' %}

| Parameter           | Example Value           | Description                     |
|:--------------------|:------------------------|:--------------------------------|
| `identity_provider` | `<<identity_provider>>` | Always `<<identity_provider>>`. |
| `target`            | `<<target>>`            | <<target_description>>          |

=== "application/json"

    ```http title="Token request"
    POST ${<<endpoint_env_var>>} HTTP/1.1
    Content-Type: application/json

    {
        "identity_provider": "<<identity_provider>>",
        "target": "<<target>>"
    }
    ```

=== "application/x-www-form-urlencoded"

    ```http title="Token request"
    POST ${<<endpoint_env_var>>} HTTP/1.1
    Content-Type: application/x-www-form-urlencoded

    identity_provider=<<identity_provider>>&
    target=<<target>>
    ```

```json title="Successful response"
{
    "access_token": "eyJra...",
    "expires_in": 3599,
    "token_type": "Bearer"
}
```

Your application does not need to validate this token.

!!! tip "Token Caching"

      The `expires_in` field denotes the lifetime of the token in seconds.

      **Cache and reuse the token until it expires** to minimize network latency impact.

      A safe cache key for this flow is `key = $target`.
