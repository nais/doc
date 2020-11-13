# Contributing

## Process

### Fixing Issues

1. Open an Issue
2. Create a PR
3. Optional: Come to pig-doc meeting to discuss

### New suggestions/report errors

1. Open an Issue with proposed content
2. Optional: Come to pig-doc meeting to discuss

## Editing

### Adding a new page

- Add a new `new_page.md` under correct category that your page belongs to
- Update `SUMMARY.md` under correct category that your page belongs to

### Publishing a release

- Merge PR to master
- Commit directly to master

## Preview branch on Github instead of master

Gitbook ([doc.nais.io](https://doc.nais.io)) only shows the content of the master branch by default.
In order to preview your branch on Gitbook, push your branch with the prefix `preview/`.

## Cool features in Gitbook

Not sure [api methods](#api-methods) is worth using.

### Hints and callouts

```bash
{% hint style="info" %}
hint text
{% endhint %}
```

Hints may have the following styles:

- success
- info
- warning
- danger

### Tabs

```
{% tabs %}
{% tab title="Yes" %}
Some text
{% endtab %}

{% tab title="No" %}
Other tab
{% endtab %}
{% endtabs %}
```

### Code tabs

```
{% code-tabs %}
{% code-tabs-item title="hello\_world.py" %}
\`\`\`python
print("hello world")
\`\`\`
{% endcode-tabs-item %}

{% code-tabs-item title="index.html" %}
\`\`\`markup
<h1>hello world</h1>
\`\`\`
{% endcode-tabs-item %}
{% endcode-tabs %}
```

### Api methods

```
{% api-method method="delete" host="https://daemon.nais.preprod.local/app" path="/namespace/app" %}
{% api-method-summary %}
Delte Naisd app
{% endapi-method-summary %}

{% api-method-description %}
When using Naisd, the only way to remove your application is to use the delete-endpoint. This will remove all the Kubernetes resources made for your application.
{% endapi-method-description %}

{% api-method-spec %}
{% api-method-request %}
{% api-method-path-parameters %}
{% api-method-parameter name="namespace" type="string" required=true %}
name of namespace
{% endapi-method-parameter %}

{% api-method-parameter name="app" type="string" required=true %}
name of app
{% endapi-method-parameter %}
{% endapi-method-path-parameters %}
{% endapi-method-request %}

{% api-method-response %}
{% api-method-response-example httpCode=200 %}
{% api-method-response-example-description %}
Done
{% endapi-method-response-example-description %}

\`\`\`
result:
service: OK
deployment: OK
redis: N/A
secret: OK
ingress OK
autoscaler: OK
alert rules: OK
service account: OK
\`\`\`
{% endapi-method-response-example %}

{% api-method-response-example httpCode=500 %}
{% api-method-response-example-description %}
Failed
{% endapi-method-response-example-description %}

\`\`\`
\`\`\`
{% endapi-method-response-example %}
{% endapi-method-response %}
{% endapi-method-spec %}
{% endapi-method %}
```
