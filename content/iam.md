# Platform IAM

Identity and Access Management in Google Cloud

## User Provisioning

We use Azure AD as a single source of truth for user and group identities. As Google Cloud does not integrate directly with Azure AD, relevant users and groups will be synchronized to Google IAM. Once a user has been synchronized, an identical Google IAM object has been created, and we are able to use Google's IAM engine to control access. Azure AD is still the master of the object, and any change in Google IAM will be overwritten on the next synchronization. Also - a user that is disabled in Azure AD will become inactive in Google IAM.

## User Management

We strive to avoid giving individual users access, and prefer granting access via an Azure AD Groups that belong to the team The team's owners manage users via either Azure AD, Outlook or Office 365.

Which users and groups that are synchronized is controlled via an Azure AD Enterprise Application. The owners of the 'Google Suite Provisioning' application controls which groups get synchronized.

## User Authentication

Once a user has been synchronized to Google IAM, she is able to sign in to Google using her @nav.no account. We have configured Google to use Azure AD as the Identity Provider, thus the user will be redirected to Azure AD to authenticate.

## Google Cloud Access

Once authenticated, the user gains access to Google Cloud resources based on the roles granted to them by the group\(s\) they belong to. As an example, kubernetes operators are granted the role 'kubernetes admin' based on their membership in the Azure AD group '\(grp\) kubernetes admin'. Application developers gain access to their team's project via the group managed by their team owner, and so forth. Take note that very few teams need their own project in Google Cloud, as most resources will be consumed via the NAIS platform.

## NAIS Access

In order to fetch valid credentials for NAIS, users have to trigger an Azure AD authentication flow using the 'gcloud command-line' tool. Once authenticated, users are granted basic view permissions in the cluster. Further kubernetes permissions are granted to the user in the namespace\(s\) belonging to the team\(s\) the developer is part of.

