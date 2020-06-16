---
description: >
  Communicate securely on the application layer across network boundaries and geographical locations
---

# TokenDings

{% hint style="danger" %}
Status: currently in open beta.

Only available in _dev-gcp_ and for "selvbetjeningsapps" (citizen facing applications) for now (however other use-cases have been identified)
{% endhint %}

**TokenDings** is a token **"thingy"** that provides security tokens to applications in order to securely communicate with other applications accross traditional boundaries such as **"security zones"** and **"security gateways"**. 

It will ensure that the original caller/subject identity is propagated while still maintaining app to app security. TokenDings is an add-on to the "**zero-trust** networking" principles (with components such as **Istio**), focusing on the application layer, making your applications truly capable of maintaining the "zero-trust" paradigm. 

TokenDings is an OAuth 2.0 Authorization Server issuing tokens based on the very same information as Istio for enforcing secure app-to-app communication, while stile maintaining the identity of the original caller (in many cases the end-user). 

If you need more information about TokenDings and the relevant `OAuth 2.0` specifications implemented you can read more about it [here](https://github.com/nais/tokendings).

## Getting Started

When creating your application [manifest](../basics/application.md) you must specify incoming and outgoing traffic from your application in an [access policy](../application-spec/access-policy.md), i.e. which applications should be allowed to access your application on the HTTP layer and which HTTP endpoints you need outside your own application.

The information provided in the access policy will be used to provision TokenDings with your app as an authorized OAuth 2.0 Client through the k8s operator [Jwker](https://github.com/nais/jwker/), which in turn will generate the keys/secrets you need to communicate with TokenDings to get a token to communicate with another application.

### Get a token from TokenDings

Your application must retrieve an `access_token` from TokenDings in order to communicate with another application (without security zones and gateways).

#### On behalf of enduser

Your application must take the token received from your identity provider and exchange it with a "properly scoped" token for NAV (i.e. a token intended for the app you are about to invoke). In order to do that you will have to send a token request to TokenDings containing the token you want to exchange. The following HTTP snippet shows an example:

```http
POST /token HTTP/1.1
Host: tokendings.prod-gcp.nais.io:8080
Content-Type: application/x-www-form-urlencoded

grant_type=urn:ietf:params:oauth:grant-type:token-exchange&
client_assertion_type=urn:ietf:params:oauth:client-assertion-type:jwt-bearer&
client_assertion=eY...............&
subject_token_type=urn:ietf:params:oauth:token-type:jwt&
subject_token=eY...............&
audience=<TARGET APP ID>
```

TODO: more doc on parameters

#### Without enduser

For now we recommend using the `OAuth 2.0 Client Credentials` flow with Azure AD as described here [NAV specific documentation](https://security.labs.nais.io/pages/guide/maskin_til_maskin_uten_bruker.html) / [Azure AD generic documentation](https://docs.microsoft.com/en-us/azure/active-directory/develop/v2-oauth2-client-creds-grant-flow#get-a-token)

### Validate a token from TokenDings

TODO. You have to trust the TokenDings issuer (pref through the well-known url) and verify that the token audience (i.e. `aud` is equal to your app's identifier)