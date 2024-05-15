# FAQ / Troubleshooting

This page lists common problems and solutions when authenticating with Azure AD.

## Missing Application Access Policy

Your application (named `A` in the examples below) attempts to consume another application (named `B`).

When requesting a token from Azure AD, your application may receive a `400 Bad Request` with an `invalid_grant` error response and the following message:

> **AADSTS501051**:
> 
> Application `'<client ID>'` (`<cluster>:<namespace>:<A>`) is not assigned to a role for the application '`api://<cluster>.<namespace>.<B>`' (`<cluster>:<namespace>:<B>`)"

Or the other variant:

> **AADSTS65001**:
>
> The user or administrator has not consented to use the application with ID '`<client ID>`' named '`<cluster>:<namespace>:<A>`'.
> 
> Send an interactive authorization request for this user and resource.

???+ success "Solution / Answer"

    - Ensure that the [scope value](README.md#scopes) in your application's request follows the correct format:

        `api://<cluster>.<namespace>.<application>/.default>`

    - Ensure that application `B`'s [access policy](configuration.md#pre-authorization) includes application `A`.
    - If all else fails, request assistance in the `#nais` channel on Slack.

## Missing User Access Policy

When attempting to sign-in or perform the on-behalf-of flow, an application may receive a `400 Bad Request` with an `invalid_grant` error response and the following message:

> **AADSTS50105**:
> 
> Your administrator has configured the application `<cluster>:<namespace>:<A>` ('`<client id>`') to block users unless they are specifically granted ('assigned') access to the application.
> 
> The signed in user '{EmailHidden}' is blocked because they are not a direct member of a group with access, nor had access directly assigned by an administrator.
>
> Please contact your administrator to assign access to this application

???+ success "Solution / Answer"

    - Ensure that application `A` has configured [user access](configuration.md#users).
    - Ensure that the given user is a _direct_ member of any configured [group](configuration.md#groups).
    - If all else fails, request assistance in the `#nais` channel on Slack.

## Tenant Mismatch for Signed-in User

While attempting to log in, you may receive the following error message from Azure AD:

> Selected user account does not exist in tenant '`some-tenant`' and cannot access the application '`<client-id>`' in that tenant.
>
> The account needs to be added as an external user in the tenant first.
>
> Please use a different account.

???+ success "Solution / Answer"

    - Ensure that the user uses an account that matches your application's [tenant](README.md#tenants) when logging in.
    - If all else fails, request assistance in the `#nais` channel on Slack.
