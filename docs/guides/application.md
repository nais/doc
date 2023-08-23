# Deploying an application

This guide will take you through the process of getting a simple NAIS application up and running and is intended for people without any previous experience with NAIS and the tools we use.

!!! note "Questions or feedback?"

    If you have any questions or feedback, please reach out to us on Slack or [GitHub Issues](https://github.com/nais/doc/issues/new/choose). We are happy to help!

## Introduction

NAIS is a platform for running applications in the cloud. It is built on top of [Kubernetes](https://kubernetes.io/) and provides a set of tools and services that makes it easy to build, deploy and operate applications in a secure and scalable way. We often say "It is like Heroku, but for the Norwegian public sector".

### Prerequisites

Before you get started, you need to make sure you have the following:

- [ ] You have a GitHub account
    - The account should be connected to your GitHub organization (e.g. `navikt`)
- [ ] You have a Google Cloud Platform account
    - In most cases this should already be set up so that you can log in with single sign-on
    - You can check your access by attempting to log in to the [Google Cloud Console](https://console.cloud.google.com). Use the same email address as your work email
    - If you do not have access, try to request the "Google Cloud Platform" app through [MyApps](https://account.activedirectory.windowsazure.com/r#/addApplications)
    - If all else fails, please reach out for further assistance
- [ ] [You have a working nais device](../device/install.md)
- [ ] [You are part of a NAIS team](../basics/teams.md#managing-your-team)
- [ ] [You have a NAIS API key](../basics/teams.md#access-to-api-keys)

### Tools required

You will need the following tools installed on your computer:

- [ ] [kubectl](https://kubernetes.io/docs/tasks/tools/install-kubectl/) - Kubernetes command-line tool
- [ ] [nais-cli](../cli/install.md) - NAIS command-line tool
- [ ] [gh-cli](https://cli.github.com/) - GitHub command-line tool
- [ ] [gcloud](https://cloud.google.com/sdk/docs/install) - Google Cloud command-line tool
- [ ] [JDK](https://adoptium.net) - Java Development Kit

    Version 17 or higher is recommended. To check, run `java -version`:
    ```shell
    $ java -version
    openjdk version "17.0.8" 2023-07-18
    ```

- [ ] Docker-cli via one of these alternatives
    - [ ] [Colima](https://github.com/abiosoft/colima) - Colima command-line tool (recommended)
    - [ ] [Rancher](https://rancherdesktop.io) - Rancher desktop
    - [ ] [Podman](https://podman-desktop.io) - Podman desktop

#### A little bit about Docker

As you can see above there is a bunch of different tools to run Docker.
The main reason for this is that Docker decided to stop their free version for non-private usage, so a bunch of alternatives started to pop up.
The most used one in NAV (at least for Mac users) is *Colima*, while *Docker Desktop* is the most used for Windows users.

If you want to use Docker Desktop you need give yourself access do Docker hub using [MyApps](https://account.activedirectory.windowsazure.com/r#/addApplications).
For Colima you can follow the [Getting started](https://github.com/abiosoft/colima#getting-started)-guide.
Remember to run `colima start` before using the Docker-cli.

### Conventions

Throughout this guide, we will use the following conventions:

- `<my-app>` - The name of your NAIS application (e.g. `joannas-first`)
- `<my-org>` - Your GitHub organization (e.g. `navikt`)
- `<my-team>` - The name of your NAIS team (e.g. `onboarding`)

**NB!** Choose names with *lowercase* letters, numbers and dashes only. 

## Step 1: Create your own GitHub repository

Create your own repo using the `nais/getting-started` as a template.

```bash
gh repo create <my-org>/<my-repo> --template nais/getting-started --private --clone
```
```bash
cd <my-app>
```

## Step 2: Grant the onboarding team access to your repository

This has to be done in the GitHub UI.

Go to your repository and click on `Settings` -> `Collaborators and teams` -> `Add teams`.

Select the team named `onboarding`, and grant them the `Write` role.

## Step 2: Familiarize yourself with the files used

Check out the files in your repository to see what they contain.

`nais.yaml` is the configuration for your application. This file contains the configuration for your application, such as the name of the application, the team that owns the application, and the port that the application listens on. You can read more about the configuration options in the [NAIS documentation](https://doc.nais.io/application/).

`Dockerfile` describes the steps needed to build your docker image.

`.github/workflows/main.yaml` is the GitHub Actions workflow that will build and deploy your application. This file contains the steps that will build your application and deploy it to NAIS. You can read more about the GitHub Actions workflow in the [GitHub Actions documentation](https://docs.github.com/en/actions).


## Step 3: Check that your application is working

Before proceeding, let's make sure that your application is working. Run the following command to start your application:

```bash
./gradlew run
```

Visit [http://localhost:8080](http://localhost:8080) to see your application running.

## Step 4: Build a Docker image with your application

Now that we have a working application, we need to build a Docker image with our application in order to run it on NAIS.

First, we need to prepare and package the application so that it can be distributed:

```bash
./gradlew clean installDist
```

Then, run the following command to build a Docker image with your application:

```bash
docker image build --platform=linux/amd64 --tag=<my-app> .
```

The `--platform=linux/amd64` flag is to instruct Docker to build a image for Linux. The default might not work.

## Step 5: Push your image to our image registry

To make the image available to NAIS, we need to push it to our image registry. We will use the Google Cloud Container Registry for this.

### Step 5.1: Configure how Docker authenticates to our image registry

```bash
gcloud auth configure-docker europe-north1-docker.pkg.dev
```

### Step 5.2: Google login

```bash
gcloud auth login --update-adc
```

### Step 5.3: Tag your image

```bash
docker tag <my-app> europe-north1-docker.pkg.dev/nais-management-233d/onboarding/<my-app>:1
```

### Step 5.4: Push your image

```bash
docker push europe-north1-docker.pkg.dev/nais-management-233d/onboarding/<my-app>:1
```
    
## Step 6: Manually deploy your application to NAIS

Open the `nais.yaml` file. It should look something like this:

=== "nais.yaml"

    ```yaml hl_lines="6 10-11"
    apiVersion: nais.io/v1alpha1
    kind: Application
    metadata:
      labels:
        team: onboarding
      name: <my-app>
      namespace: onboarding
    spec:
      ingresses:
        - https://<my-app>.intern.dev.nav.no
      image: {{image}}
      port: 8080
      ttl: 3h
      replicas:
        max: 1
        min: 1
      resources:
        requests:
          cpu: 50m
          memory: 32Mi
    ```

For the highlighted lines:

1. Replace all occurrences of `<my-app>` with the name of your application, for example:
    ```yaml
    metadata:
      name: joannas-first
    spec:
      ingresses:
        - https://joannas-first.intern.dev.nav.no
    ```
2. Replace the `{{image}}` under `spec.image` to point to the image you just pushed, for example:
    ```yaml
    spec:
      image: europe-north1-docker.pkg.dev/nais-management-233d/onboarding/joannas-first:1
    ```

Ensure you are connected to the correct cluster (dev-gcp):

```bash
kubectl config use-context dev-gcp
```

And that you are in the correct namespace:

```bash
kubectl config set-context --current --namespace=onboarding
```

Now you can deploy your application to NAIS by running the following command:

```bash
kubectl apply -f nais.yaml
```

Ensure that your application is running by running the following command:

```bash
kubectl get pods -l app=<my-app>
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

When the application is running, you can visit the application on the following URL:

```
https://<my-app>.intern.dev.nav.no
```

Congratulations! You have now deployed an application to NAIS. The next step is to automate this process using GitHub Actions.

## Step 7: Configure deployment API key

For the GitHub Actions workflow to be able to deploy your application to NAIS, it needs to be able to authenticate with the NAIS Deploy API. Add our team's API key as a secret in the repository.

```bash
gh secret set NAIS_DEPLOY_APIKEY --app actions
```

Paste in your NAIS Deploy API key as the value when asked.

## Step 8: Make some changes to your application

Open the `src/main/kotlin/Main.kt` file and change the `Hello, world!` message to something else.

## Step 8.5: Reset image reference in `nais.yaml`

Previously we changed the `{{image}}` to point to the image we pushed to our image registry. Now we need to change it back to `{{image}}` so that the GitHub Actions workflow can replace this for us.

## Step 9: Commit and push your changes

```bash
git add .
git commit -m "Change message"
git push origin main
```

## Step 10: Observe the GitHub Actions workflow

Once you have pushed your changes to GitHub, you can observe the GitHub Actions workflow by running the following command:

```bash
gh run watch
```

...or open the Actions tab on GitHub.

## Step 11: Visit your application

When the workflow is finished, you can visit the application on the following URL:

```
https://<my-app>.intern.dev.nav.no
```

## Step 12: Epilogue / Cleanup

When you are done; delete the application by running the following command:

```bash
kubectl delete -f nais.yaml
```

When you are finished with this guide you can delete your repository:

```bash
gh repo delete <my-org>/<my-app>
```
