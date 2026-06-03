# Nais API

Nais API is a GraphQL API that allows programmatic access to the Nais platform.

## Endpoint

The API endpoint is available at `<<tenant_url("console")>>graphql`

## Service Accounts

Programmatic access to the API requires authentication via a _service account_.
A service account is a non-human identity (also known as a machine user).

Service accounts can only be created and managed by [team owners](../../explanations/team.md).

### Create a Service Account

To set up a service account, visit [Nais Console](<<tenant_url("console")>>):

1. Navigate to your team in Nais Console.
2. Go to the **Settings** page.
3. Click on the **Service accounts** tab.
4. Click the **Create service account** button.
5. Follow the prompts to create a new service account.
6. The **Name** of the service account should be a descriptive human-readable identifier, e.g. the name of your workload.
7. The **Description** should describe the service account's intended purpose, use case, or to provide additional context.

You can optionally grant additional roles to the service account.

### Authentication Methods

There are two methods for service account authentication:

1. **Workload bindings** allows workloads (applications or jobs) running on Nais to authenticate as the service account by using short-lived identity tokens.
2. **API tokens** are static secret keys with an optional expiration date.

Prefer using **workload bindings**.
Only use **API tokens** when you need to access the Nais API from outside Nais.

#### Method 1: Workload Binding

To set up a workload binding for your service account:

1. Navigate to your desired service account.
2. Click the **Add workload binding** button for the service account in Nais Console.
3. Select one or more workloads that should be able to authenticate as the service account.

All workloads on Nais are automatically set up with an identity token:

- The token is injected as a file in your workload's runtime.
- Use the environment variable `NAIS_SERVICE_ACCOUNT_TOKEN_PATH` to find the path to the token file.
- The token is periodically rotated and the file is updated in-place.
- To ensure that the token is valid, you should always re-read the file before using it.

When making requests to the API, provide the token in the `Authorization` header as a Bearer token:

```http
POST /graphql HTTP/1.1
Host: console.<<tenant()>>.cloud.nais.io
Authorization: Bearer $(cat $NAIS_SERVICE_ACCOUNT_TOKEN_PATH)
```

#### Method 2: API Tokens

To set up an API token for your service account:

1. Navigate to your desired service account.
2. Click the **Create API token** button for the service account in Nais Console.
3. You should configure an expiration date for the token.

When making requests to the API, provide the token in the `Authorization` header as a Bearer token:

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
