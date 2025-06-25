{% set identity_provider = 'azuread' %}
{% set claims_reference = '../reference/README.md#claims' %}
{% set token_validation_reference = '../reference/README.md#manual-token-validation' %}
{% include 'auth/partials/validate.md' %}
