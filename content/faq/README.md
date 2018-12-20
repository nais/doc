# Frequently asked questions and issues

### I've changed my password, and now get the error `Failed to acquire a token: refreshing the expired token: refreshing token...`

Every time you change your NAV-ident password, you need to reset your Kubeconfigs credentials.

You will get an error similar to the one below:

Failed to acquire a token: refreshing the expired token: refreshing token: adal: Refresh request failed. Status Code = '400'. Response body: {"error":"invalid_grant","error_description":"AADSTS50173: The provided grant has expired due to it being revoked. The user might have changed or reset their password. ...

The easiest way to fix this is to run the following commands in the kubeconfigs-repo:

git checkout -- .
git reset
git pull

Alternatively you can just remove the values under user.auth-provider.config for the following keys, in the kubeconfigs/config-yaml file: access-token, refresh-token, expires-in, expires-on.

When this is done, perform `kubectl get pods` and follow the instructions for autenticating with Azure.
