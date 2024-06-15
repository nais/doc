---
tags: [explanation, services]
---

# Feature Toggling

## What is feature toggling?

Feature toggling is a software development technique that allows you to turn features on and off in your application without deploying new code. This can be useful for testing new features, rolling out features to a subset of users, or for turning off features that are not ready for production.

## What is Unleash?

Unleash is a feature toggle system, that gives you a great overview of all feature toggles across all your applications and services. It comes with official client implementations for Java, Node.js, Go, Ruby, Python and .Net.

You can read more about Unleash at [docs.getunleash.io](https://docs.getunleash.io/).

### Limitations and known issues

Yes, there are some limitations and known issues with Unleash:

- Enterprise features of Unleash is not available.
- Unleash is not yet fully integrated with nais applications, so you need to add an `accessPolicy` to your nais application to access Unleash and deploy an `ApiToken`. Read more about [accessing Unleash from backend applications](#access-from-backend-applications) and [creating a new API token](#creating-a-new-api-token).

### Do's and don'ts

- *Do not* create users manually in Unleash. All members of your team will automatically get access to your team's Unleash instance.
- *Do not* create api tokens manually in Unleash. API tokens are automatically created when you deploy an `ApiToken` resource in your Kubernetes namespace. Read more about [creating a new API token](#creating-a-new-api-token).
- *Do not* delete the API token named `admin` in Unleash instance. This will break the integration with Kubernetes, and you will need to contact us in [#unleash](https://nav-it.slack.com/archives/C9BPTSULS) to get it fixed.
- *Do not* delete the `RemoteUnleash` resource in your Kubernetes namespace. This will break the integration with Kubernetes, and you will need to contact us in [#unleash](https://nav-it.slack.com/archives/C9BPTSULS) to get it fixed.

### Getting started

Each team (or a collection of teams) get their own Unleash instance. Please contact us in [#unleash](https://nav-it.slack.com/archives/C9BPTSULS) to get started!

## Using Unleash

!!! note
    We are working on better integrations with nais applications to make it easier to get access to Unleash from backend and frontend applications with less configuration. Stay tuned!

### Accessing Unleash

Each team has their own instance of Unleash. Each Unleash instance has two addresses:

| Address                                            | Description    | Access from         | Authentication |
| -------------------------------------------------- | -------------- | ------------------- | -------------- |
| `https://<team>-unleash-web.iap.nav.cloud.nais.io` | Web UI address | Internet            | `@nav.no` user |
| `https://<team>-unleash-api.nav.cloud.nais.io/api` | API address    | nais and naisdevice | API token      |

<sub>*replace `<team>` with your team name.</sub>

The web UI is used for viewing and managing feature toggles. The API is used by your application to fetch feature toggles.

#### Access from backend applications

To access the Unleash API from your backend application, you need to add the following to your `nais.yaml`:

```yaml
apiVersion: "nais.io/v1alpha1"
kind: "Application"
metadata:
  name: "my-application"
  namespace: "<team>"
spec:
  ...
  accessPolicy:
    outbound:
      external:
        - host: <team>-unleash-api.nav.cloud.nais.io
```

If you don't do this you will see a similar error in your application logs:

```text
ECONNRESET", host: "<team>-unleash-api.nav.cloud.nais.io", port: 443
```

#### Access from frontend applications

The Unleash API is not not accessible directly from a browser, hence CORS is not enabled. If you need to access the Unleash API from a frontend application, you need to a proxy to the API.

##### Unleash Edge

[Unleash Edge](https://docs.getunleash.io/reference/unleash-edge) is the successor to the [Unleash Proxy](https://docs.getunleash.io/how-to/how-to-run-the-unleash-proxy) and sits between the Unleash API and your SDKs and provides a cached read-replica of your Unleash instance. This means you can scale up your Unleash instance to thousands of connected SDKs without increasing the number of requests you make to your Unleash instance.

##### Server Side Proxy

The easiest way to enable access to Unleash from your frontend application is to make a proxy on your backend to forward requests to Unleash and add API token.

You can find an example over at [unleash/unleash-client-nextjs](https://github.com/Unleash/unleash-client-nextjs/blob/ebb59d0dfabf37e2a24d1153ea09de688868cb76/example/src/pages/api/proxy-definitions.ts) but keep in mind that you will want to add CORS or preferably user authentication in front to prevent unintended access to your Unleash data.

#### Server Side Rendering (SSR)

You can load feature toggles from Unleash in your server side rendered pages without adding additional dependencies to your client JavaScript bundle. This is a quick an easy way to get started with Unleash in your frontend application.

You can find a good example for how `teamsykmelding` have solved this in their Next.js application over at [navikt/sykemelding#369](https://github.com/navikt/sykmeldinger/pull/369/files).

### Creating a new API token

You should not create API tokens manually from the Web UI – instead you should create them as a part of deploying your application.

Deploy an `ApiToken` resource to dynamically create a new Unleash API token and add it to you existing nais application as a secret:

=== "unleash-apitoken.yaml"

    ```yaml
    apiVersion: unleash.nais.io/v1
    kind: ApiToken
    metadata:
      name: my-application
      namespace: my-team
      labels:
        team: my-team
    spec:
        unleashInstance:
          apiVersion: unleash.nais.io/v1
          kind: RemoteUnleash
          name: my-team
        secretName: my-application-unleash-api-token

        # Specify which environment the API token should be created for.
        # Can be one of: development, or production.
        environment: development
    ```

=== "nais.yaml"

    ```yaml
    apiVersion: "nais.io/v1alpha1"
    kind: "Application"
    metadata:
      name: "my-application"
      namespace: "my-team"
    spec:
        ...
        envFrom:
          - secret: my-application-unleash-api-token
    ```

This will create a new API token in your Unleash instance, and create a Kubernetes secret in your namespace named `my-application-unleash-api-token` that contains two environment variables:

- `UNLEASH_SERVER_API_URL` (the API address, remember to add `/api` at the end to authenticate to the API server)
- `UNLEASH_SERVER_API_TOKEN` (the API token)
- `UNLEASH_SERVER_API_ENV` (the environment, either `development` or `production`)

In the future we will add support for automatically creating API tokens when deploying your application.

#### Known issues

- The `ApiToken` resource does not support updating the API token. If you need to update the API token, you need to delete the `ApiToken` resource using `kubectl delete apitoken <my-token> -n <my-namespace>` and deploy it again.

## Problems and solutions

### Token secret not found

If you have created a new API token, but you don't see the secret in your namespace, you can try to delete the `ApiToken` resource and deploy it again.

```bash
kubectl delete apitoken <my-token> -n <my-team>
```

Alternatively, check the status field for the `ApiToken` resource to see if there are any errors.

```bash
kubectl describe apitoken <my-token> -n <my-team>
```

??? note "Example output"
    ```text
    ...
    Status:
      Conditions:
        Last Transition Time:  2023-05-30T17:28:44Z
        Message:               API token successfully created
        Reason:                Reconciling
        Status:                True
        Type:                  Created
      Created:                 true
      Failed:                  false
    ```

### RemoteUnleash not found

If you see an error like this in your `ApiToken` status:

```text
    Message:               RemoteUnleash resource with name <my-name> not found in namespace <my-namespace>
    Reason:                UnleashNotFound
```

This means that the Unleash connection configuration for your team namespace is missing. This can happen if you deploy to a different namespace than your team name. To fix this, you need to contact us in [#unleash](https://nav-it.slack.com/archives/C9BPTSULS) to get the namespace connected to your team's Unleash instance.
