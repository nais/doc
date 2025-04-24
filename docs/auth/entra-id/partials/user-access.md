By default, no users have access to your application.
You must explicitly grant access to either [specific groups](#groups), [all users](#all-users), or [both](#groups-and-all-users).

#### Groups

To only allow access for users that belong to a specific set of groups, you must do two things:

- specify the [group identifiers](../explanations/README.md#group-identifier). To find your group's identifier, see [finding the group identifier](../explanations/README.md#finding-the-group-identifier).
- set the `allowAllUsers` property to `false`

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

Entra ID will deny logins and on-behalf-of token requests for users that aren't _direct_ members of the specified groups.
Transitive membership through nested groups is not supported.

The [`groups` claim](../reference/README.md?h=groups#claims) in JWTs will include matching groups identifiers that the user is a direct member of.

!!! warning

    Invalid group identifiers are skipped and will not be granted access to your application.
    Ensure that they are correct and exist in Entra ID.

#### All users

To allow _all_ users to access your application, set the `allowAllUsers` property to `true`:

```yaml hl_lines="5" title="app.yaml"
spec:
  azure:
    application:
      enabled: true
      allowAllUsers: true
```

This is assigns a set of extra groups to the application, which covers all users in the Entra ID tenant.
The [`groups` claim](../reference/README.md?h=groups#claims) in JWTs will also include the extra groups that the user is a direct member of.

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

- All users are allowed to access your application, i.e. through logins or on-behalf-of token requests.
- The [`groups` claim](../reference/README.md?h=groups#claims) in JWTs will include matching groups identifiers that the user is a direct member of.
This also includes the extra groups added by the `allowAllUsers` property.
