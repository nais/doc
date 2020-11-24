# Teams

Access to a resource in NAIS is based on a label set on the resource called `team`. In the context of [Azure Active Directory](https://aad.portal.azure.com/#blade/Microsoft_AAD_IAM/GroupsManagementMenuBlade/AllGroups) a group is the same as a team, and you may already be part of a team that has applications on NAIS.

Every group in [AAD](https://aad.portal.azure.com/#blade/Microsoft_AAD_IAM/GroupsManagementMenuBlade/AllGroups) has a so-called mailnick/tag, this is what NAIS generally uses to identify teams. When viewing a group, the mailnick is the value before the `@` in the email field.

## Creating a new team

* To create a new team, make a pull request to the [teams repository](https://github.com/navikt/teams) on Github
* The group's owners can manage the group using either [outlook](https://outlook.office365.com/owa) or [AAD](https://aad.portal.azure.com/#blade/Microsoft_AAD_IAM/GroupsManagementMenuBlade/AllGroups)
* The following resources will be generated for the new team:

![nais-teams](../assets/nais-teams.png)

* An Azure AD group is created, and can be viewed in the [My Groups portal](https://account.activedirectory.windowsazure.com/r#/groups)
* A [GitHub team](https://github.com/orgs/navikt/teams) is created.
* Deploy keys are created, and can be obtained in the [NAIS deploy frontend](https://deploy.nais.io/).
* GCP users are provisioned, and users can log in to the [Google Cloud Console](https://console.cloud.google.com/) using their NAV e-mail address.
* Two GCP projects are provisioned, one for development and one for production. See `https://console.cloud.google.com/home/dashboard?project=<(dev|prod)-yourteamname>`.
* Namespaces are provisioned in all Kubernetes clusters.

## Managing your team

* Team members are managed by managing the group in [My Groups portal](https://account.activedirectory.windowsazure.com/r#/groups)

!!! warning
    It is the responsibility of each team to keep the group member roster up to date. This includes removing former team members in a timely fashion.


## Access to API keys

In order to access _team API keys_, go to [deploy.nais.io](https://deploy.nais.io/). Here you will find API keys for all teams you are a member of.

## Rotate API key for a team

Go to [deploy.nais.io](https://deploy.nais.io/) and click on "Create new key" button for

## Team namespaces

Team namespaces are supported in both on-prem and in GCP. Refer to the [team namespaces documentation](../clusters/team-namespaces.md) for details.

