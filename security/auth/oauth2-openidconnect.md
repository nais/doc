# Introduction to OAuth 2.0 / OpenID Connect 

[OpenID Connect (OIDC)](https://openid.net/connect/) and [OAuth 2.0](https://oauth.net/2/) are the preferred 
specifications to provide end user authentication and ensure secure service-to-service communication for applications running on the platform.

In short, OpenID Connect is used to delegate end user authentication to a third party (e.g. [Azure AD]), 
while the OAuth 2.0 protocol can provide signed tokens ([JWT](https://oauth.net/2/jwt/)) for service-to-service communication.

As OAuth 2.0, OpenID Connect, and the variety of "flows" within those specifications can be complex and "large", 
we aim to reduce the cognitive load on the common developer by providing a guide and blueprints for the most common scenarios in NAV.

{% hint style="info" %}
If your application is running in GCP and you need access to another application on behalf of a user, check out [TokenX]
{% endhint %}

### NAV-specific Security Guide

See the [NAV Security Guide].

### Citizen-facing applications

See [ID-porten] and [TokenX]

### Employee-facing applications

See [Azure AD]

[NAV Security Guide]: https://security.labs.nais.io
[ID-porten]: ./idporten.md
[TokenX]: ./tokenx.md
[Azure AD]: ./azure-ad.md
