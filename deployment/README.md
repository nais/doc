# Deploy your application

This section will take you through the deployment of your application using _NAIS deploy_.
NAIS deploy enables you to deploy your application from any continuous integration platform.
Our primary supported platform is GitHub Actions, but you can also deploy from CircleCI, Travis CI, Jenkins, or other tools.

If you need help, please take a look at the [help page](troubleshooting.md).

## How it works
Your application is assumed to be present in the form of a Docker image when using the _NAIS deploy tool_. The _NAIS deploy tool_ is used to create a deployment request. The Docker image will be deployed to Kubernetes, and the deploy tool will wait until your deployment is rolled out, gets an error, or a timeout occurs. Underway, deployment statuses are continually posted back to _GitHub Deployment API_. Deployment logs can be viewed on _Kibana_. The link to the logs will be provided by the deploy tool.

## Set it up 

1. Your application must have a repository on GitHub containing a `nais.yml` and `Dockerfile`.
2. Your GitHub team must have _admin_ access on that repository.
3. Your GitHub team's identifier must match the _Kubernetes team label_ in your `nais.yaml`. There is an example file below.
4. Retrieve your [team API key](https://deploy.nais.io). Save the key as a secret named `NAIS_DEPLOY_APIKEY` in your GitHub repository.
5. Follow the guide below.
6. When things break, see the [help page](troubleshooting.md).

## Deploy with GitHub Actions

A GitHub Actions pipeline is called a _Workflow_. You can set up workflows by adding a YAML file to your application's Git repository.

In this example, the workflow is set up in the file `deploy.yml`. The workflow will build a Docker image and push it to GitHub Package Registry.
Next, if the code was pushed to the `master` branch AND the `build` job succeeded, the application will be deployed to NAIS.

Official GitHub documentation: [Automating your workflow with GitHub Actions](https://help.github.com/en/actions/automating-your-workflow-with-github-actions).

Get started by creating the following structure in your application repository:

```
myapplication/
├── .github/
│   └── workflows/
│       └── deploy.yml
├── Dockerfile
└── nais.yml
```

Add the example files below, then commit and push. This will trigger the workflow, and you can follow its progress
under the _Actions_ tab on your GitHub repository page.

{% code-tabs %}

{% code-tabs-item title=".github/workflows/deploy.yml" %}

```yaml
name: Build, push, and deploy

on: [push]

env:
  IMAGE: docker.pkg.github.com/${{ github.repository }}/myapplication:${{ github.sha }}

jobs:

  build:
    name: Build and push Docker container
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v1
    - name: Build and publish Docker image
      env:
        GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
      run: |
        docker build --tag ${IMAGE} .
        docker login docker.pkg.github.com -u ${GITHUB_REPOSITORY} -p ${GITHUB_TOKEN}
        docker push ${IMAGE}

  deploy:
    name: Deploy to NAIS
    needs: build
    if: github.ref == 'refs/heads/master'
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v1
    - uses: nais/deploy/actions/deploy@v1
      env:
        APIKEY: ${{ secrets.NAIS_DEPLOY_APIKEY }}
        CLUSTER: dev-fss
        RESOURCE: nais.yml
		VAR: IMAGE=${{ env.IMAGE }}
```
{% endcode-tabs-item %}

{% code-tabs-item title="nais.yml" %}

```yaml
apiVersion: nais.io/v1alpha1
kind: Application
metadata:
  name: myapplication
  namespace: myteam
  labels:
    team: myteam
spec:
  image: {{ IMAGE }}
  #image: docker.pkg.github.com/navikt/myrepository/myapplication:417dcaa2c839b9da72e0189e2cfdd4e90e9cc6fd
  #       ^--- interpolated from the $IMAGE environment variable in the action
```

In this `nais.yml` file, `{{ IMAGE }}` will be replaced by the `$IMAGE` environment variable set in the action. You can
add more by using a comma seperated list.

{% endcode-tabs-item %}

{% code-tabs-item title="Dockerfile" %}

```dockerfile
FROM nginx
```

You have to write your own Dockerfile, but if you're just trying this out,
you can use the following example file.

{% endcode-tabs-item %}

{% endcode-tabs %}

### Action configuration

| Environment variable | Default | Description |
| :--- | :--- | :--- |
| APIKEY | (required) | NAIS deploy API key. Obtained from https://deploy.nais.io. |
| CLUSTER | (required) | Which [NAIS cluster](../clusters/README.md) to deploy into. |
| DRY_RUN | `false` | If `true`, run templating and validate input, but do not actually make any requests. |
| ENVIRONMENT | (auto-detect) | The environment to be shown in GitHub Deployments. Defaults to `CLUSTER:NAMESPACE` for the resource to be deployed if not specified, otherwise falls back to `CLUSTER` if multiple namespaces exist in the given resources. |
| OWNER | (auto-detect) | Owner of the repository making the request. |
| PRINT_PAYLOAD | `false` | If `true`, print templated resources to standard output. |
| QUIET | `false` | If `true`, suppress all informational messages. |
| REF | `master` (auto-detect) | Commit reference of the deployment. Shown in GitHub's interface. |
| REPOSITORY | (auto-detect) | Name of the repository making the request. |
| RESOURCE | (required) | Comma-separated list of files containing Kubernetes resources. Must be JSON or YAML format. |
| TEAM | (auto-detect) | Team making the deployment. |
| VAR | | Comma-separated list of template variables in the form `key=value`. Will overwrite any identical template variable in the `VARS` file. |
| VARS | `/dev/null` | File containing template variables. Will be interpolated with the `$RESOURCE` file. Must be JSON or YAML format. |
| WAIT | `true` | Block until deployment has completed with either `success`, `failure` or `error` state. |

Note that `OWNER` and `REPOSITORY` corresponds to the two parts of a full repository identifier.
If that name is `navikt/myapplication`, those two variables should be set to `navikt` and `myapplication`, respectively.

## Deploy with other CI

You can still use NAIS deploy even if not using GitHub Actions.
Our deployment command line tool supports all CI tools such as Jenkins, Travis or Circle.
Use can either use a Docker image or one the [binaries] to make deployments.

{% code-tabs %}

{% code-tabs-item title="Docker usage" %}
```
docker run -it --rm navikt/deployment:v1 \
  -v $(pwd):/nais /
  /app/deploy \
    --apikey="$NAIS_DEPLOY_APIKEY" \
    --cluster="$CLUSTER" \
    --owner="$OWNER" \
    --repository="$REPOSITORY" \
    --resource="/nais/path/to/nais.yml" \
    --vars="/nais/path/to/resources" \
    --wait=true \
    ;
```

Here we use the current directory as a volume for the CLI, and we have to append `/nais` to the path to our manifest.

So if our original manifest is under `/home/cooluser/workspace/bestapp/nais.yaml`, we then need to 
`--resource="/nais/nais.yaml"`, and not only `--resource="nais.yaml"`.
{% endcode-tabs-item %}

{% code-tabs-item title="CLI usage" %}
```
deploy \
--apikey="$NAIS_DEPLOY_APIKEY" \
--cluster="$CLUSTER" \
--owner="$OWNER" \
--repository="$REPOSITORY" \
--resource="/path/to/nais.yml" \
--vars="/path/to/resources" \
--wait=true
```
{% endcode-tabs-item %}

{% endcode-tabs %}

Syntax:

```
--apikey string          NAIS Deploy API key.
--cluster string         NAIS cluster to deploy into.
--deploy-server string   URL to API server. (default "https://deployment.prod-sbs.nais.io")
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

```
stage('Deploy') {
  withEnv(['HTTPS_PROXY=http://webproxy-utvikler.nav.no:8088']) {
    ...
  }
}
```

When using NAIS deploy docker image, pass the environment variable to Docker run. 

```
sh "docker run --env HTTPS_PROXY='http://webproxy-utvikler.nav.no:8088'  ..." ;            	
```

## Templating

Templates use [Handlebars](https://handlebarsjs.com/) 3.0 syntax.
Both the template and variable file supports either YAML or JSON syntax.

A practical example follows. Create a `nais.yml` file:

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

Now, create a `vars.yml` file containing variables for your deployment:

```yaml
app: myapplication
namespace: myteam
team: myteam
image: docker.pkg.github.com/navikt/myapplication/myapplication:latest
ingresses:
  - https://myapplication.nav.no
  - https://tjenester.nav.no/myapplication
```

Run the `deploy` tool to see the final results:

```json
$ deploy --dry-run --print-payload --resource nais.yml --vars vars.yml | jq ".resources[0]"
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
    "image": "docker.pkg.github.com/navikt/myapplication/myapplication:latest",
    "ingresses": [
      "https://myapplication.nav.no",
      "https://tjenester.nav.no/myapplication"
    ]
  }
}
```

### Escaping and raw resources

If you do not specify the `--vars` or `--var` command-line flags, your resource will not be
run through the templating engine, so these resources will not need templating.

Handlebars content may be escaped by prefixing a mustache block with \\, such as:
```
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
```json
deploy --dry-run --print-payload --resource alert.yml --vars vars.yml | jq .resources
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

## Default environment variables

These environment variables will be injected into your application container

| variable | example | source |
| :--- | :--- | :--- |
| NAIS\_APP\_NAME | myapp | metadata.name from nais.yaml |
| NAIS\_NAMESPACE | default | metadata.namespace from nais.yaml |
| NAIS\_APP\_IMAGE | navikt/myapp:69 | spec.image from nais.yaml |
| NAIS\_CLUSTER\_NAME | prod-fss | naiserator runtime context |

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

[binaries]: https://github.com/nais/deploy/releases
