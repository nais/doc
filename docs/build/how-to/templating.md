---
tags: [how-to, build, deploy, templating]
---

# Templating (deprecated)

!!! warning "Deprecated"
    Handlebars templating via `nais/deploy` is deprecated. Use [environment mixins](./build-and-deploy.md#deploying-to-multiple-environments) and `--set` flags with the Nais CLI instead.

    If you have advanced templating needs that mixins and `--set` don't cover, consider adding a preprocessing step to your workflow (e.g. `envsubst`, `yq`, or a script) before calling `nais apply`.

## Legacy reference

The legacy `nais/deploy` action uses [Handlebars](https://handlebarsjs.com/) 3.0 syntax as templating language.
Both the template and variable file supports either YAML or JSON syntax.

A practical example follows.
Create a `nais.yaml` file:

```yaml
apiVersion: nais.io/v1alpha1
kind: Application
metadata:
  name: {{app}}
  namespace: {{team}}
spec:
  ingresses:
  {%- raw %}
  {{#each ingresses as |url|}}
    - {{url}}
  {{/each}}
  {% endraw %}
```

Now, create a `vars.yaml` file containing variables for your deployment:

```yaml
app: myapplication
team: myteam
ingresses:
  - https://myapplication.nav.no
  - https://tjenester.nav.no/myapplication
```

Run the `nais validate` tool to see the final results:

```bash
$ nais validate --verbose --vars vars.yaml nais.yaml
[📝] Setting template variable 'team' to 'myteam'
[📝] Setting template variable 'app' to 'myapplication'
[📝] Setting template variable 'ingresses' to '[https://myapplication.nav.no https://tjenester.nav.no/myapplication]'
[📝] Setting template variable 'namespace' to 'myteam'
[🖨️] Printing "app.yaml"...
---
apiVersion: nais.io/v1alpha1
kind: Application
metadata:
  name: myapplication
  namespace: myteam
spec:
  image: europe-north1-docker.pkg.dev/nais-management-id/myteam/myapplication:latest
  ingresses:
    - https://myapplication.nav.no
    - https://tjenester.nav.no/myapplication

[✅] "app.yaml" is valid
```
