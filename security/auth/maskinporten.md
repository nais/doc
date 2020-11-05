---
description: >
  Enabling `server-2-server` authentication using Maskinporten.
---

# Maskinporten Client

{% hint style="warning" %}
**Status: Opt-In Open Beta**

This feature is only available in the [Google Cloud Platform (GCP)](../../clusters/gcp.md) clusters.
{% endhint %}

## Abstract

Maskinporten is a service that offers a simple API security model based on the OAuth2 protocol, and the use of JWT bearer grants and inspired by [Google's System Accounts].

Maskinporten allows API providers to define access to their APIs, modeled as scopes, based on the consumer's organization number.

The Nais platform provides support for simple declarative provisioning of an [Maskinporten client] with sensible defaults that your application may use to integrate with Maskinporten.

An Maskinporten client allows your application to leverage Maskinporten for authentication and authorization requesting external apis. To achieve this, your application must implement [JWT grants].

## Configuration

### Getting Started

{% code-tabs %}
{% code-tabs-item title="Minimal nais.yaml example" %}
```yaml
apiVersion: "nais.io/v1alpha1"
kind: "Application"
metadata:
  name: nais-testapp
  namespace: aura
  labels:
    team: aura
spec:
  image: navikt/nais-testapp:66.0.0
  maskinporten:
    enabled: true
    scopes:
      - "nav:some/scope"
```
{% endcode-tabs-item %}
{% endcode-tabs %}

### Spec

See the [NAIS manifest](../../nais-application/reference.md#spec-maskinporten).

### Access Policies

// TODO in naiserator
The following [outbound external hosts](../../nais-application/access-policy.md#external-services) are automatically added when enabling this feature:

- `ver2.maskinporten.no` in development
- `maskinporten.no` in production

You do not need to specify these explicitly.

### Scopes

Maskinporten allows API providers to define access to their APIs, modeled as scopes, based on the consumer's organization number.

Maskinporten will first validate the validity of the JWT. Then the signature (used to sign the JWT) will be validated and if the 
client has access to the requested resources (scopes), an access_token will be returned to the client.

{% hint style="warning" %}
Make sure the `scopes` specified in the manifest, NAV have pre-registered with rights to **all** the scopes, or provision of client will fail.
{% endhint %}

### Runtime Variables & Credentials

// TODO nasierator
The following environment variables and files (under the directory `/var/run/secrets/nais.io/maskinporten`) are available at runtime:

{% code-tabs %}
{% code-tabs-item title="Description" %}
| Name | Description |
|---|---|
| `MASKINPORTEN_CLIENT_ID` | Maskinporten client ID. Unique ID for the application in Maskinporten |
| `MASKINPORTEN_CLIENT_JWK` | Private JWK containing the private RSA key for creating signed JWTs when using the [JWT grant]. |
| `MASKINPORTEN_SCOPES` |  The scopes registered for the client at Maskinporten as a whitepace-separated string. See [JWT grant] for more information. |
| `MASKINPORTEN_WELL_KNOWN_URL` | The well-known URL for the OIDC metadata discovery document for Maskinporten. |
{% endcode-tabs-item %}
{% code-tabs-item title="Example values" %}
| Name | Values |
|---|---|
| `MASKINPORTEN_CLIENT_ID` | `e89006c5-7193-4ca3-8e26-d0990d9d981f` |
| `MASKINPORTEN_SCOPES` | `nav:first/scope nav:another/scope` |
| `MASKINPORTEN_WELL_KNOWN_URL` | `https://ver2.maskinporten.no/.well-known/oauth-authorization-server` |
{% endcode-tabs-item %}
{% code-tabs-item title="Example value for MASKINPORTEN_CLIENT_JWK" %}
```json
{
  "use": "sig",
  "kty": "RSA",
  "kid": "jXDxKRE6a4jogcc4HgkDq3uVgQ0",
  "alg": "RS256",
  "n": "xQ3chFsz...",
  "e": "AQAB",
  "d": "C0BVXQFQ...",
  "p": "9TGEF_Vk...",
  "q": "zb0yTkgqO...",
  "dp": "7YcKcCtJ...",
  "dq": "sXxLHp9A...",
  "qi": "QCW5VQjO..."
}
```
{% endcode-tabs-item %}
{% endcode-tabs %}

## Internals

This section is intended for readers interested in the inner workings of this feature.

Provisioning is handled by [Digdirator] - a Kubernetes operator that watches a [custom resource] (called `MaskinportenClient`) that we've defined in our clusters.

Digdirator generates a Kubernetes Secret containing the values needed for your application to integrate with Maskinporten, e.g. credentials and URLs. This secret will be mounted to the pods of your application during deploy.

Every deploy will trigger rotation of credentials, invalidating any credentials that are not in use. _In use_ in this context refers to all credentials that are currently mounted to an existing pod - regardless of their status (`Running`, `CrashLoopBackOff`, etc.). In other words, credential rotation should happen with zero downtime.

More details in the [Digdirator] repository.

[Google's System Accounts]: https://developers.google.com/identity/protocols/oauth2/service-account
[Maskinporten client]: https://difi.github.io/felleslosninger/maskinporten_auth_server-to-server-oauth2.html
[JWT grant]: https://difi.github.io/felleslosninger/maskinporten_protocol_token.html