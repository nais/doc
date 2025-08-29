When performing logins, end-users are redirected to Entra ID to authenticate themselves.
After logging in, Entra ID will check that the user is authorized to access your API application.
Unauthorized users are stopped in Entra ID during the login flow.

Consumer applications acting on behalf of a user may also request tokens from Entra ID that targets your API application.
Before issuing a token, Entra ID will check that the user is authorized to access your API application.

Users are not authorized by default.
To authorize users, specify access for either [specific groups](#groups), [all users](#all-users), or [both](#groups-and-all-users).

#### Groups

To authorize users that belong to a specific set of groups, you must do two things:

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

Only _direct_ members of the specified groups are authorized.
Transitive membership through nested groups is not supported.

The [`groups` claim](../reference/README.md?h=groups#claims) in JWTs will include all matching group identifiers that the user is a direct member of.

!!! warning

    Invalid group identifiers are skipped and will not be authorized to access the application in Entra ID.
    Ensure that the identifiers are correct and that the groups exist in Entra ID.

#### All users

To authorize _all_ users, set the `allowAllUsers` property to `true`:

```yaml hl_lines="5" title="app.yaml"
spec:
  azure:
    application:
      enabled: true
      allowAllUsers: true
```

In practice, the property is equivalent to specifying a set of extra groups which covers all users in the Entra ID tenant.

The [`groups` claim](../reference/README.md?h=groups#claims) in JWTs will also include these extra groups that the user is a direct member of.

#### Groups and all users

You can also combine the above two configurations to authorize both specific groups and all users:

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

- All users are authorized to access your Entra ID application, i.e. through logins or on-behalf-of token requests.
- The [`groups` claim](../reference/README.md?h=groups#claims) in JWTs will include matching groups identifiers that the user is a direct member of.
This also includes the extra groups added by the `allowAllUsers` property.

The combined configuration is useful if you want to authorize all users through Entra ID and
additionally use the `groups` claim in your application code to implement custom authorization logic.
