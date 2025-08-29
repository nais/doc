Consumer applications may request tokens from Entra ID that targets your API application.
Before issuing a token, Entra ID will check that the consumer is authorized to access your API application.

Consumers are not authorized by default.
To authorize consumers, specify inbound access policies in your application's configuration:

```yaml title="app.yaml" hl_lines="8-15"
spec:
  azure:
    application:
      enabled: true
  accessPolicy:
    inbound:
      rules:
        - application: app-a  # same namespace and cluster

        - application: app-b  # same cluster
          namespace: other-namespace

        - application: app-c
          namespace: other-namespace
          cluster: other-cluster
```

The above configuration authorizes the following applications:

* application `app-a` running in the same namespace and same cluster as your application
* application `app-b` running in the namespace `other-namespace` in the same cluster
* application `app-c` running in the namespace `other-namespace` in the cluster `other-cluster`
