---
title: Azure AD
tags: [authentication, azure-ad, services]
description: Enabling authentication and authorization in internal web applications.
---

# Azure AD

The NAIS platform provides support for declarative provisioning of an [Azure AD application](https://docs.microsoft.com/en-us/azure/active-directory/develop/app-objects-and-service-principals).

Azure AD is our primary identity provider for internal applications.
It is used for authenticating and authorizing both users (employees) and applications.

## User Authentication

User authentication is performed by redirecting the user to Azure AD, where they will be prompted to sign in if not already authenticated.

Azure AD supports single sign-on (SSO) using the OpenID Connect Authorization Code flow.

[:octicons-arrow-right-24: Read more about the OpenID Connect Authorization Code flow](usage.md#openid-connect-authorization-code-flow)

## Application Authentication

Application authentication is performed by requesting a token from Azure AD.

There are two types of flows for requesting tokens, depending on the use case:

<div class="grid cards" markdown>

-   :octicons-server-24:{ .lg .middle } **Client Credentials**

    ---

    Machine-to-machine requests _without_ any end-user involvement.

    [:octicons-arrow-right-24: Get started with Client Credentials](usage.md#oauth-20-client-credentials-grant)

-   :octicons-person-24:{ .lg .middle } **On-Behalf-Of**

    ---

    Machine-to-machine requests _on behalf of_ an end-user.

    [:octicons-arrow-right-24: Get started with On-Behalf-Of](usage.md#oauth-20-on-behalf-of-grant)

</div>

## Concepts

The following describes a few core concepts in Azure AD referred to throughout this documentation.

### Tenants

A tenant represents an organization in Azure AD. Each tenant has their own separate sets of applications, users and groups.

An application in one tenant _cannot_ interact with other applications in _other_ tenants.

To log in to a tenant, you must use an account specific to that tenant.
This is indicated by the domain name of the account, which is the part after the `@` symbol.

NAV has two tenants in Azure AD:

| Tenant Name       | Description        |
|-------------------|--------------------|
| `nav.no`          | Production tenant  |                                                                                                                                                                                              |
| `trygdeetaten.no` | Development tenant |

!!! info "Logging into the `trygdeetaten.no` tenant"

     See <https://github.com/navikt/devuser-check/blob/main/README.md#faq> for instructions on acquiring a user and logging into this tenant. Otherwise, consult the `#tech-azure` Slack channel.

### Client ID

An Azure AD client has its own ID that uniquely identifies the client within a tenant, and is used in authentication requests to Azure AD.

Your application's Azure AD client ID is available at multiple locations:

1. The environment variable `AZURE_APP_CLIENT_ID`, available inside your application at runtime
2. In the Kubernetes resource - `kubectl get azureapp <app-name>`

You should generally **not** hard code or otherwise depend on the client ID of _other_ applications.

### Client Name

An Azure AD client has an associated name within a tenant. NAIS uses this name for lookups and identification.

All clients provisioned through NAIS will be registered in Azure AD using the following naming scheme:

```text
<cluster>:<namespace>:<app-name>
```

For example:

```text 
dev-gcp:aura:nais-testapp
```

### Scopes

A _scope_ is a parameter that is set when requesting a token. The term _scope_ in this case is synonymous with _permission_.

Generally, we will use it to indicate the intended _audience_ (or target, or recipient) for the requested token.
The audience is found in the `aud` claim in the JWT returned from Azure AD.
Its value should be equal to the recipient's unique client ID.

If you're requesting a token to consume another application, you must use the `/.default` scope.
The scope has the following format:

```text
api://<cluster>.<namespace>.<app-name>/.default
```

For example:

```text
api://dev-gcp.aura.nais-testapp/.default
```

The `/.default` scope indicates that your application is requesting _all_ available permissions granted by the _target application_.

### Groups

A _group_ in Azure AD is a collection of users.
The group itself can be assigned permissions that allows [access to applications](configuration.md#groups), data, and resources.
Members of the group will inherit all permissions that the group has been granted.

#### Group Management

There are primarily two ways to create and manage groups in Azure AD:

1. Self-service through Microsoft at <https://mygroups.microsoft.com>, or
2. "Identrutina" - consult the `#identrutina` Slack channel for assistance. You will also have to ask for the group to be synchronized to Azure AD.

#### Group Identifier

Each group is identified by its _object ID_, which is immutable and unique.

The group _name_ is **not** unique and should **never** be used by itself for authorization purposes.

In other words, two groups within the same tenant with the _exact same name_ will have _different object IDs_.
Groups with the same name will also have different IDs across different [tenants](#tenants).

#### Finding the group identifier

You can find the object ID for a given group in two ways.

First, make sure that you're logged in with an account with a domain that matches one of the [tenants](#tenants).
Then, do one of the following:

1. If you either own or are a direct member of the group, visit <https://mygroups.microsoft.com> and find the desired group.

    Browsing the detailed view for the group should reveal the ID in the address bar within the query parameter `objectId`.

2. Otherwise, visit the Groups view in the Azure AD Portal: <https://portal.azure.com/#view/Microsoft_AAD_IAM/GroupsManagementMenuBlade/~/AllGroups>

    You should be able to search and filter the list of groups.

    Consult the `#tech-azure` Slack channel for assistance if you do not have access to this page. Check the pinned/bookmarked posts first.
