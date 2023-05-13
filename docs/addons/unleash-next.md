# Unleash Next (pilot)

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

- All API calls now requires token.
- Better support for frontend applications.
- Better integration with Kubernetes and nais applications (work in progress).

### What is the status of Unleash Next?

Unleash Next is currently in pilot, and is not yet generally available for all users. We are currently working on getting it ready for prime time.

### Can I get access to Unleash Next?

Yes! If you want to help out testing Unleash Next, please contact us in [#unleash](https://nav-it.slack.com/archives/C9BPTSULS)!

## Using Unleash Next

### Accessing Unleash Next

Each team has their own instance of Unleash Next. Each Unleash Next instance has two addresses:

| Address | Description | Authentication |
|---------|-------------| ------ |
| `https://<team>-unleash-web.nav.cloud.nais.io/` | Web UI address | Requires @nav.no user |
| `https://<team>-unleash-api.nav.cloud.nais.io/api` | API address | Requires API token |

<sub>*replace `<team>` with your team name.</sub>

The web UI is used for viewing and managing feature toggles. The API is used by your application to fetch feature toggles.

#### Access from frontend applications

The Unleash API is not not accessible directly from a browser, hence CORS is not enabled. If you need to access the Unleash API from a frontend application, you need to a proxy to the API.

!!! note
    We are working on better integrations with nais applications to make it
    easier to get access to Unleash from frontend applications. Stay tuned!

##### Unleash Edge

[Unleash Edge](https://docs.getunleash.io/reference/unleash-edge) is the successor to the [Unleash Proxy](https://docs.getunleash.io/how-to/how-to-run-the-unleash-proxy) and sits between the Unleash API and your SDKs and provides a cached read-replica of your Unleash instance. This means you can scale up your Unleash instance to thousands of connected SDKs without increasing the number of requests you make to your Unleash instance.

##### Server Side Proxy

The easiest way to enable access to Unleash from your frontend application is to make a proxy on your backend to forward requests to Unleash and add API token.

Here you can see a good example for how `teamsykemelding` has solved it for their Next.js application:

- [navikt/sykemelding#369](https://github.com/navikt/sykmeldinger/pull/369/files).

### Creating a new API token

You should not create API tokens manually from the Web UI – instead you should create them as a part of deploying your application like so:

Create a new file named `unleash-api-token.yaml` with the following content:

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
```

This will create a new API token in your Unleash instance, and create a Kubernetes secret in your namespace named `my-application-unleash-api-token` that contains two environment variables:

- `UNLEASH_SERVER_API_URL` (the API address)
- `UNLEASH_SERVER_API_TOKEN` (the API token)

To use the secret in your nais application, you can add the following to your `nais.yaml`:

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

In the future we will add support for automatically creating API tokens when deploying your application.