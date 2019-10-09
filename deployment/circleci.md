# CircleCI

We've made a CircleCI orb to make your CI life easier! Simple usage documentation can be found on the [orb registry](https://circleci.com/orbs/registry/orb/navikt/nais-deployment) page. More complete documentation and usage can be fund here.

## Two ways to deploy

### Github App

If you want to use Github App as credentials you should start out by reading the [utvikling/Oppsett av Github App](https://github.com/navikt/utvikling/blob/master/Oppsett%20av%20Github%20App.md) documentation and follow the steps specified there first.

Once you have an `RSA Private Key` for a Github application that has the rights to create deployments in your Github repo you need to encrypt it and store it in the repository in question:

```text
Usage: encrypt.sh path-to-file-with-key path-to-circleci-config-folder
Example: ./encrypt.sh ../../path-to-file-with-key ../my-repo/.circleci
```

PS: The `encrypt.sh`-script can be found in [nais/circleci-nais-orb](https://github.com/navikt/circleci-nais-orb/blob/master/encrypt.sh).

Then command will return the two environment variables `OPENSSL_KEY` and `OPENSSL_IV` that you will need to set as [project environment variables](https://circleci.com/docs/2.0/env-vars/#setting-an-environment-variable-in-a-project), so that CircleCI can decrypt the private key.

After this create a `.circleci/config.yml` file, with the example below:

```yaml
version: 2.1
orbs:
  nais: 'navikt/nais-deployment:XYZ'
workflows:
  deploy-docker-and-nais:
    jobs:
      - nais/deploy-gh-app:
          context: NAIS deployment
          repo: $CIRCLE_PROJECT_USERNAME/$CIRCLE_PROJECT_REPONAME
          image: $CIRCLE_PROJECT_USERNAME/$CIRCLE_PROJECT_REPONAME
          github-app-id: 1337
          nais-template: nais.yaml
          environment: dev-fss
          team: awesome-team
```

### Github Personal Access Token

Before beginning you need to [create a personal access token](https://help.github.com/en/articles/creating-a-personal-access-token-for-the-command-line) that your CI pipeline can use to trigger the deployment. The token needs only the `repo_deployment` scope.

Then you need to add your personal access token as an [project environment variables](https://circleci.com/docs/2.0/env-vars/#setting-an-environment-variable-in-a-project) named `GITHUB_ACCESS_TOKEN`.

After this you van create a `.circleci/config.yml` file in your repository with the contents below. It also expects that your `spec.image` in your `nais.yaml` is set to `{{ version }}`. See [nais.yaml templating](circleci.md#nais-yaml-templating) if you're unsure.

```text
version: 2.1
orbs:
  nais: 'navikt/nais-deployment@XYZ'
workflow:
  deploy-personal-access:
    jobs:
      - nais/deploy-personal-token:
          context: NAIS deployment     # gives you $DOCKER_LOGIN and $DOCKER_PASSWORD
          repo: $CIRCLE_PROJECT_USERNAME/$CIRCLE_PROJECT_REPONAME
          image: $CIRCLE_PROJECT_USERNAME/$CIRCLE_PROJECT_REPONAME
          nais-template: nais.yaml
          environment: dev-fss
          team: awesome-team           # needs to be identical in Kubernetes and Github
```

This will build and push your Docker image to hub.docker.com, and then deploy your app to the `dev-fss`-cluster.

After adding the configuration to your repo you need to activate you repo as a project over at [CircleCI.com](https://circleci.com/add-projects/gh/navikt). Search for your repo, press `Set Up Project`, and go right to `Start building`.

## Different Docker registries

When the orb is logging into Docker it is using the [project environment variables](https://circleci.com/docs/2.0/env-vars/#setting-an-environment-variable-in-a-project) `DOCKER_LOGIN` and `DOCKER_PASSWORD`. Which registry is read from the `registry`-field for the respectiv orb-command.

### Docker hub

If you are pushing to `navikt` you only need to specify the `NAIS deployment` [context](https://circleci.com/docs/2.0/contexts/).

### Github

When using Github Package Registry you need to set the [project environment variables](https://circleci.com/docs/2.0/env-vars/#setting-an-environment-variable-in-a-project) `DOCKER_LOGIN` to `x-access-token` and `DOCKER_PASSWORD` to your personal access token.

You also need to specify the registry to be `docker.pkg.github.com`.

A simple example:

```text
version: 2.1
orbs:
  nais: 'navikt/nais-deployment@XYZ'
workflow:
  deploy-personal-access:
    jobs:
      - nais/deploy-ersonal-token:
          registry: docker.pkg.github.com
          repo: $CIRCLE_PROJECT_USERNAME/$CIRCLE_PROJECT_REPONAME
          image: docker.pkg.github.com/$CIRCLE_PROJECT_USERNAME/$CIRCLE_PROJECT_REPONAME/$CIRCLE_PROJECT_REPONAME
          nais-template: nais.yaml
          environment: dev-fss
          team: awesome-team
```

## nais.yaml templating

The orb can automatically insert the Docker image and tag for you. Just set `image` in your NAIS configuration to `{{version}}`.

Simplest nais.yaml example:

```yaml
apiVersion: "nais.io/v1alpha1"
kind: "Application"
metadata:
  name: <app-name>
  labels:
    team: <team-name>
spec:
  image: {{ version }}
```

