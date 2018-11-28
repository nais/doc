# Application Auth{n,z} 

## Using Azure AD
Although not directly a platform service, using Azure AD is the preferred way to provide Single Sign On, end user auth{n,z} and ensure secure service-to-service communication for applications running on the platform.
This pattern can also be used to securely traverse firewall perimiter borders without using external security mechanisms, suh as security-gw or api-gw.

_A broad outline of this flow_:   
The application sends the user to authenticate with Azure AD  
Azure AD provides an authentication code which the application can use to fetch access tokens for underlying services.   
The underlying services validates and grants access based on the access token.    

A detailed explanation and an example implementation is accessible [here](https://github.com/navikt/navs-aad-authorization-flow)
[Self service repostitory](https://github.com/navikt/IaC/tree/master/Azure/registerApplication) for registering an Azure AD application (private repository)


## Legacy
Legacy systems that haven't yet embraced using tokens for auth{n,z}, will find documentation for configuring [AM](am.md) here. (in norwegian)
