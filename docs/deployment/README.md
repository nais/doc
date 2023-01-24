# NAIS deploy

This section will take you through the deployment of your application using _NAIS deploy_. NAIS deploy enables you to deploy your application from any continuous integration platform. Our primary supported platform is GitHub Actions, but you can also deploy from CircleCI, Travis CI, Jenkins, or other tools.

If you experience any trouble along the way, please take a look at the [troubleshooting page](troubleshooting.md).

## How it works

Your application is assumed to be present in the form of a Docker image when using the _NAIS deploy tool_. The _NAIS deploy tool_ is used to create a deployment request. The Docker image will be deployed to Kubernetes, and the deploy tool will wait until your deployment is rolled out, gets an error, or a timeout occurs. Underway, deployment statuses are continually posted back to _GitHub Deployment API_. Deployment logs can be viewed on _Kibana_. The link to the logs will be provided by the deploy tool.

## Set it up

1. Your application must have a repository on GitHub containing a `nais.yaml` and `Dockerfile`.
2. Your GitHub team must have _admin_ access on that repository.
3. Your GitHub team's identifier must match the _Kubernetes team label_ in your `nais.yaml`. There is an example file below.
4. Retrieve your [team API key](https://deploy.nais.io). Save the key as a secret named `NAIS_DEPLOY_APIKEY` in your GitHub repository.
5. Follow the guide below.
6. When things break, see the [help page](troubleshooting.md).

## Deploy with GitHub Actions

A GitHub Actions pipeline is called a _Workflow_. You can set up workflows by adding a YAML file to your application's Git repository.

In this example, the workflow is set up in the file `deploy.yaml`. The workflow will build a Docker image and push it to GitHub Container Registry. Next, if the code was pushed to the `main` branch AND the `build` job succeeded, the application will be deployed to NAIS.

Official GitHub documentation: [Automating your workflow with GitHub Actions](https://help.github.com/en/actions/automating-your-workflow-with-github-actions).

Get started by creating the following structure in your application repository:

```text
myapplication/
├── .github/
│   └── workflows/
│       └── deploy.yaml
├── Dockerfile
└── nais.yaml
```

Add the example files below, then commit and push. This will trigger the workflow, and you can follow its progress under the _Actions_ tab on your GitHub repository page.

=== ".github/workflows/deploy.yaml"
    ```yaml
    name: Build, push, and deploy

    on: [push]

    env:
      docker_image: ghcr.io/${{ github.repository }}:${{ github.sha }}

    jobs:
      build:
        name: Build and push Docker container
        runs-on: ubuntu-latest
        steps:
        - uses: actions/checkout@v3
        - uses: docker/login-action@v2
          with:
            registry: ghcr.io
            username: ${{ github.actor }}
            password: ${{ secrets.GITHUB_TOKEN }}
        - uses: docker/build-push-action@v3
          with:
            context: .
            push: true
            tags: ${{ env.docker_image }}

      deploy:
        name: Deploy to NAIS
        needs: build
        if: github.ref == 'refs/heads/main'
        runs-on: ubuntu-latest
        steps:
        - uses: actions/checkout@v3
        - uses: nais/deploy/actions/deploy@v1
          env:
            APIKEY: ${{ secrets.NAIS_DEPLOY_APIKEY }}
            CLUSTER: dev-gcp
            RESOURCE: nais.yaml
            VAR: image=${{ env.docker_image }}
    ```
=== "nais.yaml"
    ```yaml
    apiVersion: nais.io/v1alpha1
    kind: Application
    metadata:
      name: myapplication
      namespace: myteam
      labels:
        team: myteam
    spec:
      image: {{ image }}
      #image: ghcr.io/navikt/myapplication:417dcaa2c839b9da72e0189e2cfdd4e90e9cc6fd
      #       ^--- interpolated from the ${{ env.docker_image }} variable in the action
    ```

    In this `nais.yaml` file, `{{ image }}` will be replaced by the `$docker_image` environment variable set in the action. You can add more by using a comma separated list, or even put all your variables in a file; see _action configuration_ below.
=== "Dockerfile"
    ```text
    FROM nginxinc/nginx-unprivileged
    ```

    You have to write your own Dockerfile, but if you're just trying this out, you can use the following example file.

### Action configuration

| Environment variable | Default | Description |
| :--- | :--- | :--- |
| APIKEY | \(required\) | NAIS deploy API key. Obtained from [https://deploy.nais.io](https://deploy.nais.io). |
| CLUSTER | \(required\) | Which NAIS cluster ([On-premises](../clusters/on-premises.md) or [GCP](../clusters/gcp.md)) to deploy into. |
| DRY\_RUN | `false` | If `true`, run templating and validate input, but do not actually make any requests. |
| ENVIRONMENT | \(auto-detect\) | The environment to be shown in GitHub Deployments. Defaults to `CLUSTER:NAMESPACE` for the resource to be deployed if not specified, otherwise falls back to `CLUSTER` if multiple namespaces exist in the given resources. |
| OWNER | \(auto-detect\) | Owner of the repository making the request. |
| PRINT\_PAYLOAD | `false` | If `true`, print templated resources to standard output. |
| QUIET | `false` | If `true`, suppress all informational messages. |
| REF | `master` \(auto-detect\) | Commit reference of the deployment. Shown in GitHub's interface. |
| REPOSITORY | \(auto-detect\) | Name of the repository making the request. |
| RESOURCE | \(required\) | Comma-separated list of files containing Kubernetes resources. Must be JSON or YAML format. |
| RETRY | `true` | Automatically retry deploying if deploy service is unavailable. |
| TEAM | \(auto-detect\) | Team making the deployment. |
| TIMEOUT | `10m` | Time to wait for deployment completion, especially when using `WAIT`. |
| VAR |  | Comma-separated list of template variables in the form `key=value`. Will overwrite any identical template variable in the `VARS` file. |
| VARS | `/dev/null` | File containing template variables. Will be interpolated with the `$RESOURCE` file. Must be JSON or YAML format. |
| WAIT | `true` | Block until deployment has completed with either `success`, `failure` or `error` state. |

Note that `OWNER` and `REPOSITORY` corresponds to the two parts of a full repository identifier. If that name is `navikt/myapplication`, those two variables should be set to `navikt` and `myapplication`, respectively.

## Deploy with other CI

You can still use NAIS deploy even if not using GitHub Actions. Our deployment command line tool supports all CI tools such as Jenkins, Travis or Circle. Use can either use a Docker image or one the [binaries](https://github.com/nais/deploy/releases) to make deployments.

=== "Docker usage"
    ```text
    docker run -it --rm -v $(pwd):/nais ghcr.io/nais/deploy/deploy:v1 \
      /app/deploy \
        --apikey="$NAIS_DEPLOY_APIKEY" \
        --cluster="$CLUSTER" \
        --owner="$OWNER" \
        --repository="$REPOSITORY" \
        --resource="/nais/path/to/nais.yaml" \
        --vars="/nais/path/to/resources" \
        --wait=true \
        ;
    ```

    Here we use the current directory as a volume for the CLI, and we have to append `/nais` to the path to our manifest.

    So if our original manifest is under `/home/cooluser/workspace/bestapp/nais.yaml`, we then need to `--resource="/nais/nais.yaml"`, and not only `--resource="nais.yaml"`.
=== "CLI usage"
    ```text
    deploy \
    --apikey="$NAIS_DEPLOY_APIKEY" \
    --cluster="$CLUSTER" \
    --owner="$OWNER" \
    --repository="$REPOSITORY" \
    --resource="/path/to/nais.yaml" \
    --vars="/path/to/resources" \
    --wait=true
    ```

Syntax:

```text
--apikey string          NAIS Deploy API key.
--cluster string         NAIS cluster to deploy into.
--deploy-server string   URL to API server.
--dry-run                Run templating, but don't actually make any requests.
--environment string     Environment for GitHub deployment. Auto-detected from nais.yaml if not specified.
--owner string           Owner of GitHub repository. (default "navikt")
--print-payload          Print templated resources to standard output.
--quiet                  Suppress printing of informational messages except errors.
--ref string             Git commit hash, tag, or branch of the code being deployed. (default "master")
--repository string      Name of GitHub repository.
--resource strings       File with Kubernetes resource. Can be specified multiple times.
--team string            Team making the deployment. Auto-detected if possible.
--var strings            Template variable in the form KEY=VALUE. Can be specified multiple times.
--vars string            File containing template variables.
--wait                   Block until deployment reaches final state (success, failure, error).
```

All of these options can be set using environment variables, such as `$APIKEY` and `$PRINT_PAYLOAD`.

### Proxy server

If you are running NAIS deploy from an internal Jenkins server you need to set up an HTTP proxy as deploy.nais.io is a public address.

When using the CLI binary you can wrap steps in your pipeline with injected environment variables.

```text
stage('Deploy') {
  withEnv(['HTTPS_PROXY=http://webproxy-utvikler.nav.no:8088']) {
    ...
  }
}
```

When using NAIS deploy docker image, pass the environment variable to Docker run.

```text
sh "docker run --env HTTPS_PROXY='http://webproxy-utvikler.nav.no:8088'  ..." ;
```

## Templating

Templates use [Handlebars](https://handlebarsjs.com/) 3.0 syntax. Both the template and variable file supports either YAML or JSON syntax.

A practical example follows. Create a `nais.yaml` file:

```yaml
apiVersion: nais.io/v1alpha1
kind: Application
metadata:
  name: {{app}}
  namespace: {{namespace}}
  labels:
    team: {{team}}
spec:
  image: {{image}}
  ingresses:
  {{#each ingresses as |url|}}
    - {{url}}
  {{/each}}
```

Now, create a `vars.yaml` file containing variables for your deployment:

```yaml
app: myapplication
namespace: myteam
team: myteam
image: ghcr.io/navikt/myapplication:latest
ingresses:
  - https://myapplication.nav.no
  - https://tjenester.nav.no/myapplication
```

Run the `deploy` tool to see the final results:

```javascript
$ deploy --dry-run --print-payload --resource nais.yaml --vars vars.yaml | jq ".resources[0]"
{
  "apiVersion": "nais.io/v1alpha1",
  "kind": "Application",
  "metadata": {
    "labels": {
      "team": "myteam"
    },
    "name": "myapplication",
    "namespace": "default"
  },
  "spec": {
    "image": "ghcr.io/navikt/myapplication:417dcaa2c839b9da72e0189e2cfdd4e90e9cc6fd",
    "ingresses": [
      "https://myapplication.nav.no",
      "https://tjenester.nav.no/myapplication"
    ]
  }
}
```

### Escaping and raw resources

If you do not specify the `--vars` or `--var` command-line flags, your resource will not be run through the templating engine, so these resources will not need templating.

Handlebars content may be escaped by prefixing a mustache block with \, such as:

```text
\{{escaped}}
```

Real-world example:

```yaml
apiVersion: nais.io/v1alpha1
kind: Alert
metadata:
  name: {{app}}
  labels:
    team: {{team}}
spec:
  alerts:
  - action: Se `kubectl describe pod \{{ $labels.kubernetes_pod_name }}` for events, og `kubectl logs \{{ $labels.kubernetes_pod_name }}` for logger
    alert: {{app}}-fails
    description: '\{{ $labels.app }} er nede i \{{ $labels.kubernetes_namespace }}'
    expr: up{app=~"{{app}}",job="kubernetes-pods"} == 0
    for: 2m
    severity: danger
    sla: respond within 1h, during office hours
  receivers:
    slack:
      channel: '#{{team}}'
```

Will result in:

```javascript
deploy --dry-run --print-payload --resource alert.yaml --vars vars.yaml | jq .resources
[
  {
    "apiVersion": "nais.io/v1alpha1",
    "kind": "Alert",
    "metadata": {
      "labels": {
        "team": "myteam"
      },
      "name": "myapplication"
    },
    "spec": {
      "alerts": [
        {
          "action": "Se `kubectl describe pod {{ $labels.kubernetes_pod_name }}` for events, og `kubectl logs {{ $labels.kubernetes_pod_name }}` for logger",
          "alert": "myapplication-fails",
          "description": "{{ $labels.app }} er nede i {{ $labels.kubernetes_namespace }}",
          "expr": "up{app=~\"myapplication\",job=\"kubernetes-pods\"} == 0",
          "for": "2m",
          "severity": "danger",
          "sla": "respond within 1h, during office hours"
        }
      ],
      "receivers": {
        "slack": {
          "channel": "#myteam"
        }
      }
    }
  }
]
```

PS: Templating will not be run if you do not use `VARS` and/or `VAR`, meaning `\{{ }}` will not be handled by nais/deploy.

## Default environment variables

These environment variables will be injected into your application container

| variable | example | source |
| :--- | :--- | :--- |
| NAIS\_APP\_NAME | myapp | metadata.name from nais.yaml |
| NAIS\_NAMESPACE | default | metadata.namespace from nais.yaml |
| NAIS\_APP\_IMAGE | navikt/myapp:69 | spec.image from nais.yaml |
| NAIS\_CLUSTER\_NAME | prod-fss | naiserator runtime context |
| NAIS\_CLIENT\_ID | prod-fss:default:myapp | concatenation of cluster, namespace and app name  |

Environment variables for loading CA bundles into your application will also be injected:

| variable | example | source |
| :--- | :--- | :--- |
| NAV\_TRUSTSTORE\_PATH | /etc/ssl/certs/java/cacerts | CA bundle containing the most commonly used CA root certificates |
| NAV\_TRUSTSTORE\_PASSWORD | xxxxx | Password for the CA bundle |

## Build status badge

Use the following URL to create a small badge for your workflow/action.

```text
https://github.com/{github_id}/{repository}/workflows/{workflow_name}/badge.svg
```

