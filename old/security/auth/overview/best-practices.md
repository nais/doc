# Best Practices

- Use widely used and well-known [libraries](development.md#libraries-and-frameworks) instead of rolling-your-own implementations.
- Avoid performing unnecessary network calls to [identity providers](../concepts/actors.md#identity-provider)
    - **Cache [public keys](../concepts/actors.md#jwks-endpoint-public-keys)** if possible, somewhere between 1 to 24 hours.
    - **Cache [tokens](../concepts/actors.md#token-endpoint)** locally if possible.
- For the [OpenID Connect Authorization Code Flow](../concepts/protocols.md#authorization-code-flow), **use [PKCE](https://oauth.net/2/pkce/)**.
    - Do _not_ use the [implicit grant](https://oauth.net/2/grant-types/implicit/) - it is considered deprecated and less secure.
- If using cookies, ensure that you set [appropriate attributes](https://developer.mozilla.org/en-US/docs/Web/HTTP/Cookies):
    - `HttpOnly` - disallow access from client-side JavaScript
    - `Secure` - only allow transmission for HTTPS requests
    - `SameSite` - should be `Lax` eller `Strict` to combat cross-site request forgery.

It is also recommended that you familiarize yourself with the following specifications:

- [RFC 6819 - OAuth 2.0 Threat Model and Security Considerations](https://datatracker.ietf.org/doc/html/rfc6819)
- [Draft RFC - OAuth 2.0 Security Best Current Practice](https://datatracker.ietf.org/doc/html/draft-ietf-oauth-security-topics)
