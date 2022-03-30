# Client

The NAIS platform provides support for simple declarative provisioning of a _client_ that your application may use to integrate with Maskinporten, and in turn consume services and APIs served by external agencies.

The client allows your application to leverage Maskinporten for authentication and authorization when performing service-to-service requests to external agencies.
To achieve this, your application must:

- implement [JWT grants](https://docs.digdir.no/maskinporten_protocol_jwtgrant.html)
- request tokens from [the `/token`-endpoint](https://docs.digdir.no/maskinporten_protocol_token.html) with the above JWT grants

When a client requests a token from Maskinporten:

- Maskinporten validates the validity of the JWT and its signature ([Runtime JWK Secret](#runtime-variables-and-credentials) used to sign the JWT).
- If the client has access to the requested list of `scopes`, an `access_token` will be returned to the client. The token can be used for authentication to the intended external service.

!!! danger
    Make sure that the relevant service providers have pre-registered **NAV**'s organization (number: `889640782`) as a valid consumer of any scopes that you define. Provisioning of client will fail otherwise.

    NAV´s `pre-registered` scopes can be found with proper access rights in [Digdir selvbetjening](https://selvbetjening-samarbeid-ver2.difi.no/auth/login).

## Getting Started

### Access Policies

Maskinporten is a third-party service outside of our clusters, which is not reachable by default like most third-party services.

#### Google Cloud Platform \(GCP\)

The following [outbound external hosts](../../../nais-application/access-policy.md#external-services) are automatically added when enabling this feature:

- `ver2.maskinporten.no` in development
- `maskinporten.no` in production

You do not need to specify these explicitly.

#### On-premises

You must enable and use [`webproxy`](../../../nais-application/application.md#webproxy) for external communication.

### Spec

See the [NAIS manifest](../../../nais-application/application.md#maskinporten).

### Configuration

=== "nais.yaml"
    ```yaml
    spec:
      maskinporten:
        enabled: true 
        scopes:
          consumes:
            - name: "skatt:some.scope"
            - name: "nav:some/other/scope"

      # required for on-premises only
      webproxy: true
    ```

## Usage

### Runtime Variables and Credentials

The following environment variables and files (under the directory `/var/run/secrets/nais.io/maskinporten`) are available at runtime:

---

#### `MASKINPORTEN_CLIENT_ID`

???+ note

    [Client ID](../concepts/actors.md#client-id) that uniquely identifies the application in Maskinporten.

    Example value: `e89006c5-7193-4ca3-8e26-d0990d9d981f`

---

#### `MASKINPORTEN_SCOPES`

???+ note

    The scopes registered for the client at Maskinporten as a whitepace-separated string. See [JWT grants](https://docs.digdir.no/maskinporten_protocol_token.html) for more information.

    Example value: `nav:first/scope nav:another/scope`

---

#### `MASKINPORTEN_WELL_KNOWN_URL`

???+ note

    The well-known URL for the OAuth 2.0 authorization server (in this case, Maskinporten) [metadata document](../concepts/actors.md#well-known-url-metadata-document).

    Example value: `https://ver2.maskinporten.no/.well-known/oauth-authorization-server`

---

#### `MASKINPORTEN_CLIENT_JWK`

???+ note

    [Private JWK](../concepts/cryptography.md#private-keys) containing an RSA key belonging to your client. Used to sign client assertions during [client authentication](../concepts/actors.md#client-assertion).

    ```javascript
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

### Consuming an API

Refer to the [documentation at DigDir](https://docs.digdir.no/docs/Maskinporten/maskinporten_guide_apikonsument.html#5-be-om-token).

You may skip any step involving client registration as this is automatically handled when [enabling this feature](#configuration).

## Legacy

!!! info
    This section only applies if you have an existing client registered at the [IaC repository](https://github.com/navikt/nav-maskinporten)

### Migration guide to keep existing Maskinporten client (NAIS application only)

The following describes the steps needed to migrate a client registered in [IaC repository](https://github.com/navikt/nav-maskinporten).

#### Step 1 - Update your client description in the IaC repository

- Ensure the **`description`** of the client registered in the `IaC` repository follows the naming scheme:

```text
<cluster>:<metadata.namespace>:<metadata.name>
```

#### Step 3 - Deploy your NAIS application with Maskinporten provisioning enabled

- See [configuration](#consumes-configuration).

#### Step 4 - Delete your application from the IaC repository

- Verify that everything works after the migration
- Delete the application from the [IaC repository](https://github.com/navikt/nav-maskinporten) in order to maintain a single source of truth.

## Permanently deleting a client

!!! warning
    Permanent deletes are irreversible. Only do this if you are certain that you wish to completely remove the client from DigDir
    and deactivates exposed scopes and granted access for consumers wil be removed.

    When a `MaskinportenClient` resource gets deleted from a Kubernetes cluster, the client will not be deleted from DigDir.

!!! info
    The `Application` resource owns the `MaskinportenClient` resource, deletion of the former will thus trigger a deletion of the latter.

    If the `MaskinportenClient` resource is recreated, the client will thus retain the same client ID.

If you want to completely delete the client from DigDir, you must add the following annotation to the `MaskinportenClient` resource:

```bash
kubectl annotate maskinportenclient <app> digdir.nais.io/delete=true
```

When this annotation is in place, deleting the `MaskinportenClient` resource from Kubernetes will trigger removal of the client and inactivating of registered scopes from DigDir.
