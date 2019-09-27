# Deployment-cli

## Manual deploy

In your pipeline, use our internal tool [deployment-cli](https://github.com/navikt/deployment-cli) to make deployment requests. Variables you need to include are _cluster_, _repository_, _team_, full path to _resources_, and your Github credentials.

Example syntax for deploying with a personal access token:

```bash
deployment-cli create \
  --cluster=dev-fss \
  --repository=navikt/deployment \
  --team=<TEAM> \
  --username=x-access-token \
  --password=<GITHUB_ACCESS_TOKEN> \
  --resources=nais.yaml
```

Instead of having seperated files per cluster, you can use deployment-cli built-in templating. See [deployment-cli templating guide](#handling-multiple-deployments-using-deployment-cli-built-in-templating) for how.

## Handling multiple deployments using deployment-cli built-in templating

Deployment-cli has built in templating using [Handlebars](https://handlebarsjs.com/), this makes it possible to create multiple deployments using the same nais.yaml as a template and different configuration files for placeholders. This is done by using the `--vars` flag, and passing in the path to your json-file with the correct variables to use with this deployment. You can also specify variables in the call to `deployment-cli` using the `--var` flag.

By default deployment-cli will also inject a few of the flags passed to it:

* `ref` - git reference. Specified by the `--ref` flag. Defaults to `master`
* `cluster` - which cluster the deploy is for. Specified by the `--cluster/-c` flag. Defaults to `dev-fss`
* `team` -  the team this deployment is for. Specified by the `--team/-t` flag.

### Example

Our json with our variables, let's call it `dev.json`:
```json
{
  "application_name": "testapp",
  "env": {
    "TEST_ENV": "hello world",
    "SECOND_ENV_VAR": "world hello"
  }
}
```

The following is the `nais.yaml` that act as the template for the deployment.
```yaml
apiVersion: "nais.io/v1alpha1"
kind: "Application"
metadata:
  name: {{application_name}}
  namespace: default
  labels:
    team: {{team}}
spec:
  image: "docker.pkg.github.com/navikt/{{application_name}}/{{application_name}}:{{docker_tag}}"
  port: 8080
  replicas:
    min: 1
    max: 4
    cpuThresholdPercentage: 70
  liveness:
    path: /is_alive
  readiness:
    path: /is_alive
  prometheus:
    enabled: true
    path: /prometheus
  env:
  {{#each env}}
    name: '{{@key}}'
    value: '{{this}}'
  {{/each}}
```

Finally it is all merged together with the following `deployment-cli` commando:
```bash
deployment-cli create \
  --cluster=dev-fss \
  --repository=navikt/deployment \
  --team=testers \
  --username=x-access-token \
  --password=<GITHUB_ACCESS_TOKEN> \
  --resources=nais.yaml \
  --vars=dev.json \
  --var docker_tag=v1.0.0
```

Here `docker_tag` and `team` will be injected by the flags passed to deployment-cli, `application_name will` come from the configuration file. For each pair in the `env` tag it will inject the key as the env var name and value as is.

Since your `nais.yaml` files often will contain actual endpoints and other concrete values, we consider it the best practice to have a separate private repository for your nais configuration files if your application is open source. Each team typically has a single repository containing config for the applications they are maintaining.
