By default, no users have access to your application.
You must explicitly grant access to either [specific groups](#groups), [all users](#all-users), or both.

#### All users

The following configuration grants _all_ users access your application:

```yaml hl_lines="5" title="app.yaml"
spec:
  azure:
    application:
      enabled: true
      allowAllUsers: true
```

#### Groups

The following configuration only grants users that are _direct_ members of the specified groups access to your application:

```yaml hl_lines="5-8" title="app.yaml"
spec:
  azure:
    application:
      enabled: true
      allowAllUsers: false
      claims:
        groups:
          - id: "<group identifier>"
```

!!! warning

    Invalid [group identifiers](../explanations/README.md#group-identifier) are skipped and will not be granted access to your application.
    Ensure that they are correct and exist in Entra ID.
