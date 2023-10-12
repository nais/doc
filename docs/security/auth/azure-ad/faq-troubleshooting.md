# FAQ / Troubleshooting

## "Application `Alice` is not assigned to a role for the application `Bob`"

???+ quote "Example"

    An application may receive the following `400 Bad Request` response error when requesting a token from Azure AD:

    ```json
    {
      "error": "invalid_grant",
      "error_description": "AADSTS501051: Application '<client ID>'(<cluster>:<namespace>:<alice>) is not assigned to a role for the application 'api://<cluster>.<namespace>.<bob>'(<cluster>:<namespace>:<bob>)",
      ...
    }
    ```

    Or the other variant:

    ```json
    {
      "error": "invalid_grant",
      "error_description": "AADSTS65001: The user or administrator has not consented to use the application with ID '<client ID>' named '<cluster>:<namespace>:<alice>'. Send an interactive authorization request for this user and resource.",
      ...
    }
    ```

???+ success "Solution / Answer"

    - Ensure that the [scope value](README.md#scopes) follows the correct format - `api://<cluster>.<namespace>.<app-name>/.default>`
    - Ensure that Bob's [access policy](configuration.md#pre-authorization) includes Alice.
    - If all else fails, ask an adult in the `#nais` channel on Slack.

## "The signed in user is blocked because they are not a direct member of a group with access"

???+ quote "Example"

    An application may receive the following `400 Bad Request` response error when requesting a token from Azure AD:

    ```json
    {
      "error": "invalid_grant",
      "error_description": "AADSTS50105: Your administrator has configured the application <cluster>:<namespace>:<alice> ('<client id>') to block users unless they are specifically granted ('assigned') access to the application. The signed in user '{EmailHidden}' is blocked because they are not a direct member of a group with access, nor had access directly assigned by an administrator. Please contact your administrator to assign access to this application",
      ...
    }
    ```

???+ success "Solution / Answer"

    - Ensure that the Alice application has configured [user access](configuration.md#users).
    - Ensure that the given user is a _direct_ member of any configured [group](configuration.md#groups).
    - If all else fails, ask an adult in the `#nais` channel on Slack.


## "Selected user account does not exist in tenant 'some-tenant' and cannot access the application 'some-client-id' in that tenant. The account needs to be added as an external user in the tenant first. Please use a different account."

???+ quote "Problem"

    A user may receive the above message from Azure AD when attempting to log in.

???+ success "Solution / Answer"

    - Ensure that the user uses an account that matches your application's [tenant](README.md#tenants) when logging in.
    - If all else fails, ask an adult in the `#nais` channel on Slack.
