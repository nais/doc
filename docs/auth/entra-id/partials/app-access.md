Consumer applications may request tokens from Entra ID that targets your API application.
Before issuing a token, Entra ID will check that the consumer is authorized to access your API application.

Consumers are not authorized by default.
To authorize consumers, specify inbound access policies in your application's configuration.
Use `namespace` for the consumer's team name and `cluster` for its environment:

```yaml title="app.yaml" hl_lines="8-15"
spec:
  azure:
    application:
      enabled: true
  accessPolicy:
    inbound:
      rules:
        - application: app-a  # same team and environment

        - application: app-b  # same environment
          namespace: other-team

        - application: app-c
          namespace: other-team
          cluster: other-environment
```

The above configuration authorizes the following applications:

* application `app-a` in your team and environment
* application `app-b` in `other-team` in your environment
* application `app-c` in `other-team` in `other-environment`
