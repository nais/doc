Deployment-cli
==============

## Handling multiple deployments using deployment-cli built in templating

deployment-cli has built in templating using [Handlebars](https://handlebarsjs.com/), this makes it possible to create
multiple deployments using the same nais.yaml as a template and different configuration files for placeholders. By
default deployment-cli will also inject a few of the flags passed to it:

 * ref: git reference. Specified by the --ref flag. Default: master
 * cluster: which cluster the deploy is for. Specified by the --cluster/-c flag. Default: dev-fss
 * team: the team this deployment is for. Specified by the --team/t flag.
 * version: the version, this is strictly for templating and should be used to specify which version of the Docker file should be pulled. Specified using the --version flag

```yaml
apiVersion: "nais.io/v1alpha1"
kind: "Application"
metadata:
  name: {{application_name}}
  namespace: default
  labels:
    team: {{team}}
spec:
  image: "docker.pkg.github.com/navikt/{{application_name}}/{{application_name}}:{{version}}"
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

Here the version number and team name will be injected by the flags passed to deployment-cli, application_name will come
from the configuration file. For each pair in the env tag it will inject the key as the env var name and value as is.
```javascript
{
  "application_name": "example_app",
  "env": {
    "MY_ENV_VAR": "cluster specific value",
    "SECOND_ENV_VAR": "another one"
  }
}
```

Since your `nais.yaml` files often will contain actual endpoints and other concrete values, we consider it the best practice to have a separate private repository for your nais configuration files if your application is open source. Each team typically has a single repository containing config for the applications they are maintaining.
