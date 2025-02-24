{% set endpoint_env_var = 'NAIS_TOKEN_ENDPOINT' %}
{% include 'auth/partials/texas-header.md' %}

| Parameter           | Example Value           | Description                     |
|:--------------------|:------------------------|:--------------------------------|
| `identity_provider` | `<<identity_provider>>` | Always `<<identity_provider>>`. |
| `target`            | `<<target>>`            | <<target_description>>          |

{% if additional_parameters %}
<<additional_parameters>>
{% endif %}

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

{% include 'auth/partials/texas-footer.md' %}
