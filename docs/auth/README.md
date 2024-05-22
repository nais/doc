---
tags: [auth, explanation]
description: Services and addons to support authentication and authorization in your applications.
---
# Authentication and Authorization Overview

NAIS helps your applications [log in users](#logging-in-users), [validate inbound requests](#validating-inbound-requests) and [make authenticated outbound requests](#making-outbound-requests) using the following identity providers:

<div class="grid cards" markdown>

- [**Azure AD**][Azure AD] (aka Entra ID)

    For employees and internal services.

- [**ID-porten**][ID-porten]

    For Norwegian citizens.

- [**TokenX**][TokenX]

    For internal applications acting on-behalf-of ID-porten citizens.

- [**Maskinporten**][Maskinporten]

    For machine-to-machine communication between organizations or businesses.

</div>

Your application may have multiple use cases that can require a combination of services.

See the different scenarios below to identify which service(s) you need for your application, and follow the links to the respective service for more details.

## Logging in users

Depending on who your users are, you can use the following services to log them in:

:person_standing: Log in employees :octicons-arrow-right-24: [Azure AD](../security/auth/azure-ad/sidecar.md)

:person_standing: Log in citizens :octicons-arrow-right-24: [ID-porten]

## Validating inbound requests

...from applications acting 

```mermaid
graph TD
  B1[on-behalf-of]
  B2[as themselves]

  B1 --> |citizens| TokenX[<a href='../security/auth/tokenx'>TokenX</>]
  B1 --> |employees| AAD_machine[<a href='../security/auth/azure-ad'>Azure AD</>]
    
  
  B2 --> |internally| AAD_machine[<a href='../security/auth/azure-ad'>Azure AD</>]
  B2 --> |externally| Maskinporten[<a href='../security/auth/maskinporten'>Maskinporten</a>]
```

The graph above can also be described as:

:material-server::person_standing: Validate requests from application on behalf of employee :octicons-arrow-right-24: [Azure AD]

:material-server::person_standing: Validate requests from application on behalf of citizen :octicons-arrow-right-24: [TokenX]

:material-server: Validate requests from internal application :octicons-arrow-right-24: [Azure AD]

:material-server: Validate requests from external application :octicons-arrow-right-24: [Maskinporten]

## Making outbound requests

```mermaid
graph TD
  B1[on-behalf-of]
  B2[as application]

  B1 --> |citizens| TokenX[<a href='../security/auth/tokenx'>TokenX</>]
  B1 --> |employees| AAD_machine[<a href='../security/auth/azure-ad'>Azure AD</>]
  
  B2 --> |internally| AAD_machine[<a href='../security/auth/azure-ad'>Azure AD</>]
  B2 --> |externally| Maskinporten[<a href='../security/auth/maskinporten'>Maskinporten</a>]
```

The graph above can also be described as:

:material-server::person_standing: Make requests on behalf of employee :octicons-arrow-right-24: [Azure AD]

:material-server::person_standing: Make requests on behalf of citizen :octicons-arrow-right-24: [TokenX]

:material-server: Make requests to internal API :octicons-arrow-right-24: [Azure AD]

:material-server: Make requests to external API :octicons-arrow-right-24: [Maskinporten]

[Azure AD]: ../security/auth/azure-ad/README.md
[ID-porten]: ../security/auth/idporten.md
[TokenX]: tokenx/README.md
[Maskinporten]: maskinporten/README.md
