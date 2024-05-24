---
tags: [entra-id, azure-ad, explanations]
---

# Entra ID concepts

This page describes core concepts and glossary for Entra ID.

## Tenants

A tenant represents an organization in Entra ID. Each tenant has their own separate sets of applications, users and groups.

An application in one tenant _cannot_ interact with other applications in _other_ tenants.

To log in to a tenant, you must use an account specific to that tenant.
This is indicated by the domain name of the account, which is the part after the `@` symbol.

See the [tenants reference](../reference/README.md#tenants) for a list of available tenants.

## Client ID

An Entra ID client has its own ID that uniquely identifies the client within a tenant, and is used in authentication requests to Entra ID.

Your application's Entra ID client ID is available at runtime as an [environment variable](../reference/README.md#runtime-variables-credentials).

You should generally **not** hard code or otherwise depend on the client ID of _other_ applications.

## Client Name

An Entra ID client has an associated name within a tenant. NAIS uses this name for lookups and identification.

All clients provisioned through NAIS will be registered in Entra ID using the following naming scheme:

```text
<cluster>:<namespace>:<app-name>
```

For example:

```text 
dev-gcp:aura:nais-testapp
```

## Scopes

A _scope_ is a parameter that is set when requesting a token. The term _scope_ in this case is synonymous with _permission_.

Generally, we will use it to indicate the intended _audience_ (or target, or recipient) for the requested token.
The audience is found in the `aud` claim in the JWT returned from Entra ID.
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

## Groups

A _group_ in Entra ID is a collection of users.
The group itself can be granted [access to applications](../how-to/secure.md#users).

### Group Identifier

Each group is identified by its _object ID_, which is immutable and unique.

The group _name_ is **not** unique and should **never** be used by itself for authorization purposes.

In other words, two groups within the same tenant with the _exact same name_ will have _different object IDs_.
Groups with the same name will also have different IDs across different [tenants](#tenants).

{%- if tenant() == "nav" %}
### Group Management

There are primarily two ways to create and manage groups in Entra ID:

1. Self-service through Microsoft at <https://mygroups.microsoft.com>, or
2. "Identrutina" - consult the `#identrutina` Slack channel for assistance. You will also have to ask for the group to be synchronized to Entra ID.

### Finding the group identifier

You can find the object ID for a given group in two ways.

First, make sure that you're logged in with an account with a domain that matches one of the [tenants](#tenants).
Then, do one of the following:

1. If you either own or are a direct member of the group, visit <https://mygroups.microsoft.com> and find the desired group.

   Browsing the detailed view for the group should reveal the ID in the address bar within the query parameter `objectId`.

2. Otherwise, visit the Groups view in the Entra ID Portal: <https://portal.azure.com/#view/Microsoft_AAD_IAM/GroupsManagementMenuBlade/~/AllGroups>

   You should be able to search and filter the list of groups.

   Consult the `#tech-azure` Slack channel for assistance if you do not have access to this page. Check the pinned/bookmarked posts first.
{%- endif %}
