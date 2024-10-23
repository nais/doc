By default, no users have access to your application.
You must explicitly grant access to either [specific groups](#groups), [all users](#all-users), or [both](#groups-and-all-users).

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

where each group is specified by their unique [identifier](../explanations/README.md#group-identifier).

To find your group's identifier, see [finding the group identifier](../explanations/README.md#finding-the-group-identifier).

!!! warning

    Invalid group identifiers are skipped and will not be granted access to your application.
    Ensure that they are correct and exist in Entra ID.

#### All users

The following configuration grants _all_ users access your application:

```yaml hl_lines="5" title="app.yaml"
spec:
  azure:
    application:
      enabled: true
      allowAllUsers: true
```

#### Groups and all users

If you want to implement custom group-based authorization logic in your application, combine the above two configurations:

```yaml hl_lines="5-8" title="app.yaml"
spec:
  azure:
    application:
      enabled: true
      allowAllUsers: true
      claims:
        groups:
          - id: "<group identifier>"
```

This has the following effects:

- All users will have access to your application
- If a given user is a direct member of any matching group, the group's identifier will be emitted in [the `groups` claim](../reference/README.md?h=groups#claims).
