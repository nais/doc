# Concepts

The following describes a few core concepts in Azure AD referred to throughout this documentation.

## Tenants

A tenant represents an organization in Azure AD. Each tenant will have their own set of applications, users and groups. In order to log in to a tenant, you must use an account specific to that tenant.

NAV has two tenants in Azure AD:

| Tenant            | Tenant Alias  | Cluster Availability                         |
|-------------------|---------------|----------------------------------------------|
| `nav.no`          | `NAV`         | `prod-gcp`, `prod-fss`, `dev-gcp`, `dev-fss` |                                                                                                                                                                                              |
| `trygdeetaten.no` | `NAV Preprod` | `dev-gcp`, `dev-fss`                         |

!!! info "Logging into the `trygdeetaten.no` tenant"

    See <https://github.com/navikt/devuser-check/blob/main/README.md#faq> for instructions on acquiring a user and logging into this tenant. Otherwise, consult the `#tech-azure` Slack channel.

The table below shows the default tenant value for each cluster:

| Clusters               | Default Tenant    | 
|------------------------|-------------------|
| `prod-gcp`, `prod-fss` | `nav.no`          | 
| `dev-gcp`, `dev-fss`   | `trygdeetaten.no` |

!!! info "Using the `nav.no` tenant in the `dev-*` clusters"

    If you want to use the `nav.no` tenant in the `dev-*`-clusters, then you must [explicitly configure this](configuration.md#tenants).
    Note that you _cannot_ interact with other clients or applications across different tenants.

    If you're consuming services from other teams, you will very likely have to stick to the default values. If you control all the services in the call-chain in a closed ecosystem, you may choose to use `nav.no` in the `dev-*`-clusters.

The same application in different clusters will result in unique Azure AD clients, with each having their own client IDs and access policies. For instance, the following applications in the same `nav.no` tenant:

* `app-a` in `dev-gcp`
* `app-a` in `prod-gcp`

will result in two unique clients being registered in Azure AD.

## Naming format

An Azure AD client has an associated name within a tenant. NAIS uses this name for lookups and identification.

All clients provisioned through NAIS will be registered in Azure AD using the following naming scheme:

```text
<cluster>:<namespace>:<app-name>
```

??? example
    ```text 
    dev-gcp:aura:nais-testapp
    ```

## Scopes

A _scope_ is a parameter that is set during authorization flows of an end-user to Azure AD (where `scope=openid <scope1> <scope2>` and so on), 
or when requesting a token using the on-behalf-of (OBO) or client credentials flows. The term _scope_ in this case is synonymous with _permission_.

Generally, we will use it to indicate the intended _audience_ (the expected target resource) for the requested token, 
which is found in the `aud` claim in the JWT returned from Azure AD.

### Default scope

The `/.default` scope is a static scope which indicates to Azure AD that your application is requesting _all_ available permissions
that have been granted to your application.

When performing either the on-behalf-of (OBO) or client credentials flows, the `./default` scope must be used.

When consuming a downstream API that expects an Azure AD token, you must therefore set the correct scope to fetch a token
that your API provider accepts.

The scope has the following format:

```text
api://<cluster>.<namespace>.<app-name>/.default
```

For example:

```text
api://dev-gcp.aura.nais-testapp/.default
```

## Client ID

An Azure AD client has its own ID that uniquely identifies the client within a tenant, and is used in authentication requests to Azure AD.

Your application's Azure AD client ID is available at multiple locations:

1. The environment variable `AZURE_APP_CLIENT_ID`, available inside your application at runtime
2. In the Kubernetes resource - `kubectl get azureapp <app-name>`

## Groups

A _group_ in Azure AD is a collection of users.
The group itself can be assigned permissions that allows [access to applications](access-policy.md#groups), data, and resources.
Members of the group will inherit all permissions that the group has been granted.

### Group Management

There are primarily two ways to create and manage groups in Azure AD:

1. Self-service through Microsoft at <https://mygroups.microsoft.com>, or
2. "Identrutina" - consult the `#identrutina` Slack channel for assistance. You will also have to ask for the group to be synchronized to Azure AD.

### Group Identifier

Each group is identified by its _object ID_, which is immutable and unique.

The group _name_ is **not** unique and should **never** be used by itself for authorization purposes.

In other words, two groups within the same tenant with the _exact same name_ will have _different object IDs_.
Groups with the same name will also have different IDs across different [tenants](#tenants).

### Finding the group identifier

You can find the object ID for a given group in two ways.

First, make sure that you're logged in with an account with a domain that matches one of the [tenants](#tenants).
Then, do one of the following:

1. If you either own or are a direct member of the group, visit <https://mygroups.microsoft.com> and find the desired group.

    Browsing the detailed view for the group should reveal the ID in the address bar within the query parameter `objectId`.

2. Otherwise, visit the Groups view in the Azure AD Portal: <https://portal.azure.com/#view/Microsoft_AAD_IAM/GroupsManagementMenuBlade/~/AllGroups>

    You should be able to search and filter the list of groups.

    Consult the `#tech-azure` Slack channel for assistance if you do not have access to this page. Check the pinned/bookmarked posts first.
