# Nais API

Nais API is a GraphQL API that allows programmatic access to the Nais platform.

## Endpoint

The API endpoint is available at `<<tenant_url("console")>>graphql`

## Service Accounts

Access to the API requires authentication.
For programmatic access, you must set up a service account in [Nais Console](<<tenant_url("console")>>):

1. Navigate to your team in Nais Console.
2. Go to the **Settings** page.
3. Click on the **Service accounts** tab.
4. Click the **Create service account** button.
5. Follow the prompts to create a new service account.
6. Configure an **Authentication method** for the service account.

### Workload Binding

To access the API from a workload running on Nais, set up the **Workload binding** authentication method for your service account.

Workloads on Nais are configured with a workload token, available as a file at the path specified by the `NAIS_SERVICE_ACCOUNT_TOKEN_PATH` environment variable.
The token is periodically rotated; re-read the file before use rather than caching its contents.

Use the token as a Bearer token in the `Authorization` header when making requests to the API:

```http
POST /graphql HTTP/1.1
Host: console.<<tenant()>>.cloud.nais.io
Authorization: Bearer $(cat $NAIS_SERVICE_ACCOUNT_TOKEN_PATH)
```

### API Tokens

To access the API from outside the Nais platform, set up the **API token** authentication method for your service account.
Configure an expiration date for the token and rotate it regularly.

Use the token as a Bearer token in the `Authorization` header when making requests to the API:

```http
POST /graphql HTTP/1.1
Host: console.<<tenant()>>.cloud.nais.io
Authorization: Bearer $API_TOKEN
```

## Local Development

For local development, use [the `nais` CLI](https://cli.nais.io):

```shell
nais api proxy
```

This starts a local proxy that forwards requests to the Nais API using your personal credentials.

The proxy also exposes a GraphQL playground at `http://localhost:4242` by default for exploring the API and testing queries.
