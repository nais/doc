---
tags: [how-to, build, deploy, templating]
---

# Templating

In nais/deploy we use [Handlebars](https://handlebarsjs.com/) 3.0 syntax as templating language.
Both the template and variable file supports either YAML or JSON syntax.

A practical example follows.
Create a `nais.yaml` file:

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
  {{\#each ingresses as |url|}} # remove slash
    - {{url}}
  {{/each}}
```

Now, create a `vars.yaml` file containing variables for your deployment:

```yaml
app: myapplication
namespace: myteam
team: myteam
image: europe-north1-docker.pkg.dev/nais-management-id/myteam/myapplication:latest
ingresses:
  - https://myapplication.nav.no
  - https://tjenester.nav.no/myapplication
```

Run the [`nais validate`](../../operate/cli/reference/validate.md) tool to see the final results:

```bash
$ nais validate --verbose --vars vars.yaml nais.yaml
[📝] Setting template variable 'team' to 'myteam'
[📝] Setting template variable 'app' to 'myapplication'
[📝] Setting template variable 'image' to 'europe-north1-docker.pkg.dev/nais-management-id/myteam/myapplication:latest'
[📝] Setting template variable 'ingresses' to '[https://myapplication.nav.no https://tjenester.nav.no/myapplication]'
[📝] Setting template variable 'namespace' to 'myteam'
[🖨️] Printing "app.yaml"...
---
apiVersion: nais.io/v1alpha1
kind: Application
metadata:
  name: myapplication
  namespace: myteam
  labels:
    team: myteam
spec:
  image: europe-north1-docker.pkg.dev/nais-management-id/myteam/myapplication:latest
  ingresses:
    - https://myapplication.nav.no
    - https://tjenester.nav.no/myapplication

[✅] "app.yaml" is valid
```

### Escaping and raw resources

If you do not specify the `--vars` or `--var` command-line flags, your resource will not be run through the templating engine, so these resources will not need templating.

Handlebars content may be escaped by prefixing a mustache block with `\`, such as:

```text
\{{escaped}}
```

Real-world example:

```yaml
apiVersion: monitoring.coreos.com/v1
kind: PrometheusRule
metadata:
  name: {{app}}
  labels:
    team: {{team}}
spec:
  groups:
  - name: "app-alerts"
    rules:
    - alert: {{app}}-fails
      expr: up{app=~"{{app}}",job="kubernetes-pods"} == 0
      for: 2m
      annotations:
        consequence: Application is unavailable
        action: Se `kubectl describe pod \{{ $labels.kubernetes_pod_name }}` for events, og `kubectl logs \{{ $labels.kubernetes_pod_name }}` for logger
        summary: '\{{ $labels.app }} er nede i \{{ $labels.kubernetes_namespace }}'
      labels:
        namespace: {{team}}
        severity: danger
```

!!! Info
    Templating will not be run if you do not use `VARS` and/or `VAR`, meaning `\{{escaped}}` will not be handled by nais/deploy.
