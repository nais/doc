# Unleash Next (beta)

!!! note
    This is a work in progress, and is not yet available for use. If you want to help out, please contact us in [#unleash](https://nav-it.slack.com/archives/C9BPTSULS)!

## What is Unleash?

Unleash is a feature toggle system, that gives you a great overview of all feature toggles across all your applications and services. It comes with official client implementations for Java, Node.js, Go, Ruby, Python and .Net.

You can read more about Unleash at [docs.getunleash.io](https://docs.getunleash.io/).

## What is Unleash Next?

Unleash Next is our next generation of Unleash, which will be replacing the current Unleash instance.

### Why are we replacing Unleash?

The current Unleash instance is outdated, and needs to be upgraded. In our current setup, we have a single instance of Unleash, which is used by all of NAV. This means that if Unleash goes down, all of NAV is affected. We want to avoid this, and have a more robust setup where each team has their own instance of Unleash.

### What is the difference between Unleash and Unleash Next?

The most notable difference is the version of Unleash. Unleash Next is based on Unleash 4 (soon 5), while the current Unleash instance is based on Unleash 3.

Unleash v4 is a major rewrite of Unleash, and has a lot of new features as well as some breaking changes. You can read more about the changes in the [Unleash v4 migration guide](https://docs.getunleash.io/reference/deploy/migration-guide#upgrading-from-v3x-to-v4x) but the most notable changes are:

- All API calls now requires token authentication.
- Better support for frontend applications.
- Better integration with Kubernetes and nais applications (work in progress).

To connect to your team's instance of Unleash, you'll need to add an `accessPolicy` to your nais application. Read more about [accessing Unleash from backend applications](#access-from-backend-applications).

### What is the status of Unleash Next?

Unleash Next is currently in beta, and is not yet generally available for all users. We are currently working on getting it ready for prime time.

### Will my feature toggles be migrated to Unleash Next?

No, you will need to recreate your feature toggles in Unleash Next and then re-deploy your applications with a newer Unleash SDK version and reference your new Unleash Next instance.

### Are there any limitations or known issues with Unleash Next?

Yes, there are some limitations and known issues with Unleash Next:

- Unleash Next is currently in beta, and is not yet generally available for all teams.
- Unleash Next is based on Unleash OSS, which means that some Enterprise features may not be available.
- Unleash Next is not yet fully integrated with nais applications, so you need to add an `accessPolicy` to your nais application to access Unleash Next and deploy an `ApiToken`. Read more about [accessing Unleash from backend applications](#access-from-backend-applications) and [creating a new API token](#creating-a-new-api-token).

We also have som do's and don'ts:

- *Do not* create users manually in Unleash Next. All members of your team will automatically get access to your team's Unleash Next instance.
- *Do not* create api tokens manually in Unleash Next. API tokens are automatically created when you deploy an `ApiToken` resource in your Kubernetes namespace. Read more about [creating a new API token](#creating-a-new-api-token).
- *Do not* delete the API token named `admin` in Unleash Next instance. This will break the integration with Kubernetes, and you will need to contact us in [#unleash](https://nav-it.slack.com/archives/C9BPTSULS) to get it fixed.
- *Do not* delete the `RemoteUnleash` resource in your Kubernetes namespace. This will break the integration with Kubernetes, and you will need to contact us in [#unleash](https://nav-it.slack.com/archives/C9BPTSULS) to get it fixed.

### Can I get access to Unleash Next?

Yes! If you want to help out testing Unleash Next, please contact us in [#unleash](https://nav-it.slack.com/archives/C9BPTSULS)!

## Using Unleash Next

!!! note
    We are working on better integrations with nais applications to make it easier to get access to Unleash from backend and frontend applications with less configuration. Stay tuned!

### Accessing Unleash Next

Each team has their own instance of Unleash Next. Each Unleash Next instance has two addresses:

| Address | Description | Access from | Authentication |
|---------|-------------| ----------- | -------------- |
| `https://<team>-unleash-web.nav.cloud.nais.io/` | Web UI address | Internet | @nav.no user |
| `https://<team>-unleash-api.nav.cloud.nais.io/api` | API address | nais and naisdevice | API token |

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

In the future we will add support for automatically creating API tokens when deploying your application.

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
