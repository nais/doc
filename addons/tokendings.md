---
description: >
  *Zero trust* communication for the application layer: within a cluster or across network boundaries and geographical locations
---

# TokenDings

{% hint style="danger" %}
Status: currently in open beta.

Only available in *GCP* and for *self-service/citizen facing applications* for now (however other use-cases have been identified)
{% endhint %}

**TokenDings** is an OAuth 2.0 Authorization server that provides applications with security tokens in order to securely communicate with eachother in a **zero trust** architecture - to the extent that  traditional boundaries such as **security zones** and **security gateways** can be made obsolete. 

It will ensure that the original caller/subject identity is propagated while still maintaining app to app security. TokenDings is an add-on to the *zero trust networking* principles (with components such as **Istio**), focusing on the application layer, making your applications truly capable of maintaining the *zero trust* paradigm. 

TokenDings issues tokens based on the very same information as Istio for enforcing secure app-to-app communication, while stile maintaining the identity of the original caller (in many cases the end-user). 

If you need more detailed information about TokenDings and the relevant `OAuth 2.0` specifications implemented you can read more about it [here](https://github.com/nais/tokendings).

## Getting Started

When creating your application [manifest](../basics/application.md) you must specify incoming and outgoing traffic from your application in an [access policy](../application-spec/access-policy.md), i.e. which applications should be allowed to access your application on the HTTP layer and which HTTP endpoints you need access to outside your own application.

The information provided in the access policy will be used to provision TokenDings with your app as an authorized OAuth 2.0 Client through the k8s operator [Jwker](https://github.com/nais/jwker/), which in turn will generate the keys/secrets you need to communicate with TokenDings; i.e. to get a token in order to communicate with another application.

### Get a token from TokenDings

TokenDings will issue an `access_token` in *JWT* format based on the information provided in the token request. This token can be used as a *bearer token* when calling your target API. The two most common scenarios when requiring a token are:

* Calling an API on behalf of an enduser
* Calling an API with the identity of your application

#### On behalf of an enduser

Your application must take the token received from your identity provider and exchange it with a "properly scoped" token for NAV (i.e. a token intended for the app you are about to invoke). In order to do that you will have to send a token request to TokenDings containing the token you want to exchange. The following HTTP snippet shows an example:

```http
POST /token HTTP/1.1
Host: tokendings.prod-gcp.nais.io
Content-Type: application/x-www-form-urlencoded

grant_type=urn:ietf:params:oauth:grant-type:token-exchange&
client_assertion_type=urn:ietf:params:oauth:client-assertion-type:jwt-bearer&
client_assertion=eY...............&
subject_token_type=urn:ietf:params:oauth:token-type:jwt&
subject_token=eY...............&
audience=prod-fss:namespace1:app1
```



| Parameter               | Value                                                    | Comment                                                      |
| ----------------------- | -------------------------------------------------------- | ------------------------------------------------------------ |
| `grant_type`            | `urn:ietf:params:oauth:grant-type:token-exchange`        | The identifier of the OAuth 2.0 grant to use, in this case the OAuth 2.0 Token Exchange grant. This grants allows applications to exchange one token for a new one containing much of the same information while still being correctly "scoped" in terms of OAuth. |
| `client_assertion_type` | `urn:ietf:params:oauth:client-assertion-type:jwt-bearer` | Identifies the type of *assertion* the client/application will use to authenticate itself to TokenDings, in this case a JWT. |
| `client_assertion`      | A serialized JWT identifying the calling app             | A JWT signed by the calling client/application, identifying itself to TokenDings. |
| `subject_token_type`    | `urn:ietf:params:oauth:token-type:jwt`                   | Identifies the type of token that will be exchanged with a new one, in this case a JWT |
| `subject_token`         | A serialized JWT, the token that should be exchanged     | The actual token (JWT) containing the signed-in user         |
| `audience`              | The identifier of the app you wish to use the token for  | Identifies the intended audience for the resulting token, i.e. the target app you request a token for. |

#### Without enduser

For now we recommend using the `OAuth 2.0 Client Credentials` flow with Azure AD as described here [NAV specific documentation](https://security.labs.nais.io/pages/guide/maskin_til_maskin_uten_bruker.html) / [Azure AD generic documentation](https://docs.microsoft.com/en-us/azure/active-directory/develop/v2-oauth2-client-creds-grant-flow#get-a-token)

### Validate a token from TokenDings

TODO. You have to trust the TokenDings issuer (pref through the well-known url) and verify that the token audience (i.e. `aud` is equal to your app's identifier)