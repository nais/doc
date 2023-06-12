# A Basic Guide

Welcome to NAIS! This guide will take you through the process of getting up your first NAIS application up and running and is intended for people without any previous experience with NAIS and the tools we use.

## Introduction

NAIS is a platform for running applications in the cloud. It is built on top of [Kubernetes](https://kubernetes.io/) and provides a set of tools and services that makes it easy to build, deploy and operate applications in a secure and scalable way. We often say "It is like Heroku, but for the Norwegian public sector".

In this guide, we will show you how to build a simple web application and deploy it to NAIS. You will learn how to:

- Dockerizing your application
- Configuring your application for NAIS
- Building your application on GitHub Actions
- Deploying your application to NAIS

### Prerequisites

Before you get started, you need to make sure you have the following:

- [x] You have a GitHub account
- [x] You have a GCP account
- [x] You have a working nais device
- [x] [You have a NAIS team](../basics/teams.md#creating-a-new-team)
- [x] [You have a NAIS API key](../basics/teams.md#access-to-api-keys)

### Tools used in this guide

You will need the following tools installed on your computer:

- [kubectl](https://kubernetes.io/docs/tasks/tools/install-kubectl/) - Kubernetes command-line tool
- [docker](https://docs.docker.com/get-docker/) - Docker command-line tool
- [nais-cli](https://doc.nais.io/cli/installation/) - NAIS command-line tool
- [gh-cli](https://cli.github.com/) - GitHub command-line tool

### Conventions

Throughout this guide, we will use the following conventions:

- `my-repo` - The name of your GitHub repository (e.g. `my-org/my-repo`)
- `my-app` - The name of your NAIS application (e.g. `my-app`)
- `my-team` - The name of your NAIS team (e.g. `my-team`)

### Code examples

We will provide all the commands and code examples you need to get started. You can copy and paste these examples into your terminal or editor.

For programming related code you have the option to choose between different languages. In these cases, we will provide the examples in the following format:

=== "Node.js"

    ```javascript
    console.log('Hello world!')
    ```

=== "Java"

    ```java
    System.out.println("Hello world!");
    ```

=== "Fortran"

    ```fortran
    print *, "Hello world!"
    ```

=== "Cobol"

    ```cobol
    IDENTIFICATION DIVISION.
    PROGRAM-ID. HELLO-WORLD.
    PROCEDURE DIVISION.
        DISPLAY "Hello world!".
        STOP RUN.
    ```

## Create a new repository

Create a new repository on GitHub. This will be the home of your application.

```bash
gh repo create <my-repo> --add-readme --clone
```

For your new repository add the following secret:

```bash
gh secret set NAIS_DEPLOY_APIKEY --app actions
```

Paste in your NAIS API key as the value when asked.

## Create a new application

In your repository, initialize a new application depending on the language you want to use.

=== "Node.js"

    ```bash
    npx express-generator
    ```

=== "Next.js"

    ```bash
    npx create-next-app
    ```

=== "Java (Maven)"

    ```bash
    mvn archetype:generate -DgroupId=com.example -DartifactId=my-app -DarchetypeArtifactId=maven-archetype-quickstart -DinteractiveMode=false
    ```

=== "Kotlin (Gradle)"

    ```bash
    gradle init --type kotlin-application
    ```

## Create nais.yaml

Now you are ready to deploy your application to NAIS. To do this, you need to create a `nais.yaml` file in your repository. This file contains the configuration for your application. The easiest way to create this file is to use the `nais` CLI tool.

```bash
nais start --appname <my-app> --teamname <my-team> --appListenPort 3000
```

??? note "What does this command do?"

    * `--appname <my-app>`: The name of your application. This will be the name of the application in NAIS and should be something unique to you.
    * `--teamname <my-team>`: The name of your team. This will be used as the name of the team in NAIS.
    * `--appListenPort 3000`: The port that your application listens on. This will be used for the exposed port and liveness checks in NAIS.

This will create the required files for your application to run on NAIS. This will create the following files in your repository:

| File | Description |
| -----| ----------- |
| `.github/workflows/main.yaml` | The GitHub Actions workflow that will build and deploy your application. |
| `./nais/nais.yaml` | The configuration for your application. |
| `./nais/dev.yaml` | The configuration overrides for your application in the `dev` environment. |

Check out the files in your repository to see what they contain.

`nais.yaml` is the configuration for your application. This file contains the configuration for your application, such as the name of the application, the team that owns the application, and the port that the application listens on. You can read more about the configuration options in the [NAIS documentation](https://doc.nais.io/application/).

`dev.yaml` is the configuration overrides for your application in the `dev` environment. This file contains the configuration for your application in the `dev` environment, such as ingress domain, number of replicas, and the amount of memory and CPU.

`.github/workflows/main.yaml` is the GitHub Actions workflow that will build and deploy your application. This file contains the steps that will build your application and deploy it to NAIS. You can read more about the GitHub Actions workflow in the [GitHub Actions documentation](https://docs.github.com/en/actions).

Open `.github/workflows/main.yaml` in your repository and remove everything below this line (around 40):

```yaml
  "deployAppToProd":
```

This will remove the step that deploys your application to the `prod` environment as we will not be deploying to `prod` in this guide.

## Create a Dockerfile

In order to run your application on NAIS, you need to package it in a [Container image](https://www.docker.com/resources/what-container/) also often referred to as a [Docker image](https://docs.docker.com/get-started/overview/). Throughout this guide, we will use the terms interchangeably.

There are several ways to build a container image, but the easiest way is to use a [`Dockerfile`](https://docs.docker.com/engine/reference/builder/). `nais start` will create a minimal Dockerfile for you, but we can improve it for our example application. In your repository, open the file named `Dockerfile` and add the following content:

=== "Node.js"

    ```dockerfile
    FROM cgr.dev/chainguard/node:20 AS base
    LABEL org.opencontainers.image.source="https://github.com/<my-repo>"
    RUN npm config set update-notifier false && \
        npm config set fund false && \
        npm config set progress true && \
        npm config set loglevel error

    # -----------------------------------------------------------------------------
    # Build the application
    # -----------------------------------------------------------------------------
    FROM base AS builder
    COPY --chown=node:node . .
    RUN npm install --no-audit
    # RUN npm install --no-audit && npm run build

    # -----------------------------------------------------------------------------
    # Production dependencies
    # -----------------------------------------------------------------------------
    FROM base AS deps
    COPY --from=builder /app/package.json ./package.json
    COPY --from=builder /app/package-lock.json ./package-lock.json
    RUN npm install --no-audit --omit=dev

    # -----------------------------------------------------------------------------
    # Production image, copy all the files and run the application
    # -----------------------------------------------------------------------------
    FROM base AS runner

    ENV NODE_ENV production
    ENV PORT 3000

    # Copy dependencies from deps stage
    COPY --from=deps --chown=node:node /app/package.json ./package.json
    COPY --from=deps --chown=node:node /app/package-lock.json ./package-lock.json
    COPY --from=deps --chown=node:node /app/node_modules ./node_modules
    # Automatically leverage output traces to reduce image size (https://s.id/1Gplb)
    COPY --from=builder --chown=node:node /app/app.js ./app.js
    COPY --from=builder --chown=node:node /app/bin/www ./bin/www
    COPY --from=builder --chown=node:node /app/public ./public
    COPY --from=builder --chown=node:node /app/routes ./routes
    COPY --from=builder --chown=node:node /app/views ./views

    EXPOSE $PORT

    CMD ["/usr/bin/npm", "run", "start"]
    ```

=== "Next.js"

    ```dockerfile
    FROM cgr.dev/chainguard/node:20 AS base
    LABEL org.opencontainers.image.source="https://github.com/<my-repo>"
    ENV NEXT_TELEMETRY_DISABLED 1
    RUN npm config set update-notifier false && \
        npm config set fund false && \
        npm config set progress true && \
        npm config set loglevel error

    # -----------------------------------------------------------------------------
    # Build the application
    # -----------------------------------------------------------------------------
    FROM base AS builder
    COPY --chown=node:node . .
    RUN npm install --no-audit && npm run build

    # -----------------------------------------------------------------------------
    # Production dependencies
    # -----------------------------------------------------------------------------
    FROM base AS deps
    COPY --from=builder /app/package.json ./package.json
    COPY --from=builder /app/package-lock.json ./package-lock.json
    RUN npm install --no-audit --omit=dev

    # -----------------------------------------------------------------------------
    # Production image, copy all the files and run the application
    # -----------------------------------------------------------------------------
    FROM base AS runner

    ENV NODE_ENV production
    ENV PORT 3000

    # Copy dependencies from deps stage
    COPY --from=deps --chown=node:node /app/package.json ./package.json
    COPY --from=deps --chown=node:node /app/package-lock.json ./package-lock.json
    COPY --from=deps --chown=node:node /app/node_modules ./node_modules
    # Automatically leverage output traces to reduce image size (https://s.id/1Gplb)
    COPY --from=builder --chown=node:node /app/next.config.js ./next.config.js
    COPY --from=builder --chown=node:node /app/public ./public
    COPY --from=builder --chown=node:node /app/.next ./.next

    EXPOSE $PORT

    CMD ["/usr/bin/npm", "run", "start"]
    ```

This `Dockerfile` will build your application and package it in a container image. Make sure you choose the correct `Dockerfile` for your programming language or framework. The `Dockerfile` above is a good starting point for most applications, but you might need to modify it depending on your application.

The `Dockerfile` above are based on [Chainguard images](https://www.chainguard.dev/chainguard-images) a light weight and secure base for your applications, and use a [multi-stage build](https://docs.docker.com/develop/develop-images/multistage-build/) to reduce the size of the final container image. The final container image will only contain the files needed to run your application.

To test that your Dockerfile works, run the following command:

```bash
docker build -t <my-app> .
```

You can run this container image locally by running the following command:

```bash
docker run -p 3000:3000 <my-app>
```

Visit [http://localhost:3000](http://localhost:3000) to see your application running.

## Deploy to NAIS

Now you are ready to deploy your application to NAIS. To do this, you need to push your code to GitHub. This will trigger the GitHub Actions workflow that will build and deploy your application to NAIS.

```bash
git commit -m "Build and deploy application to NAIS" .
git push
```

GitHub will automatically start the GitHub Actions workflow. You can follow the progress of the workflow by running the following command:

```bash
gh run watch
```

When the workflow is finished, you can visit the application in the `dev` environment by going to the following URL:

```bash
https://<my-app>.intern.dev.nav.no
```

## Inspecting the application

Your new application is now running in nais. Under the hood, nais is using Kubernetes to run your application. You can inspect your application by running the following commands.

Select the correct Kubernetes context:

```bash
kubectl config use-context dev-gcp
```

Select the correct Kubernetes namespace:

```bash
kubectl config set-context --current --namespace=<my-team>
```

List the pods running in the namespace:

```bash
kubectl get pods
```

??? note "Example output"
    ```bash
    NAME                         READY   STATUS    RESTARTS   AGE
    my-app-6b4dd85578-2hk8d      1/1     Running   0          2m
    ```

You should see a pod with the name `<my-app>-<random-string>`. You can inspect the logs from this pod by running the following command:

```bash
kubectl logs -f <my-app>-<random-string>
```

## Cleaning up

When you are done with this tutorial, you can delete the application by running the following command:

```bash
kubectl delete app <my-app>
```

**NB!** Remember to do this for all environments you have deployed to.

You can also archive the GitHub repository by running the following command:

```bash
gh repo archive <my-repo>
```
