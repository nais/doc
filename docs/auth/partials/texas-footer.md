```json title="Successful response"
{
    "access_token": "eyJra...",
    "expires_in": 3599,
    "token_type": "Bearer"
}
```

Your application does not need to validate this token.

!!! info "Tokens are automatically cached by default"

    The endpoint will always return a cached token, if available.
    The endpoint will never return an expired token.

    To forcibly get a new token, set the `skip_cache` property to `true` in the request.
    This is only necessary if the token is denied by the target API, for example if permissions have changed since the token was issued.
