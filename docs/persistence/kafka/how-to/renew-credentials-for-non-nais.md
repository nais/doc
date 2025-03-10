---
tags: [kafka, how-to]
conditional: [tenant, nav]
---

# Renew credentials for non-Nais applications

Eventually the credentials created in [Accessing topics from an application outside Nais](access-from-non-nais.md) will expire.
Well in advance of this, Aiven will issue a notification to the technical contacts, and we route those to the slack channel [#aiven-driftsmeldinger](https://nav-it.slack.com/archives/C01TT8SS4LA).

When it is time to renew the credentials, follow these steps:

## Edit the AivenApplication resource

You need to change the `.spec.secretName` field in the `AivenApplication` resource you used to create the credentials in the first place.
Make a note of the current value, and change it to something suitable.
You can use any valid name you want, but make sure it is different from the old name.

## Wait for a new secret to appear

When you save/apply the changed secret name, new credentials are generated.
When complete, a secret with the requested name will become available in the cluster.

## Extract updated credentials

Extract the credentials from the newly created secret, in the same way as you originally did when you first created the `AivenApplication` resource.

```bash
kubectl get secret <MY-UNIQUE-SECRET-NAME> --namespace <MY-TEAM> --contect <MY-ENV> -o jsonpath='{.data}' 
```

Make the values available to your application.

## Clean up

When your application has been updated to use the new credentials and you see that everything is working, delete the old secret.

```bash
kubectl delete secret <MY-OLD-SECRET-NAME> --namespace <MY-TEAM> --context <MY-ENV>
```
