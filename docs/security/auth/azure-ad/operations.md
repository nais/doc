# Operations

## Forcing resynchronization

Synchronization to Azure AD only happens when at least one of three things happen:

1. Any [spec.azure.* or spec.accessPolicy.inbound.rules[]](configuration.md#spec) value has changed.
2. A previously non-existing Azure AD app defined in `spec.accessPolicy.inbound.rules[]` has been created through NAIS.
3. An annotation is applied to the resource:

```bash
kubectl annotate azureapp <app> azure.nais.io/resync=true
```

The annotation is removed after synchronization. It can then be re-applied to trigger new synchronizations.

## Forcing credential rotation

Credential rotation happens automatically on a regular basis.

However, if you need to trigger rotation manually you may do so by applying the following annotation:

```bash
kubectl annotate azureapp <app> azure.nais.io/rotate=true
```

You should then restart your pods so that the new credentials are re-injected:

```bash
kubectl rollout restart deployment <app>
```

## Deletion

The client is automatically deleted from Azure AD whenever the associated `Application` resource is deleted from Kubernetes.
That is, if you were to run the following command:

```shell
kubectl delete app <application>
```

the `AzureAdApplication` resource will also be deleted from Kubernetes, and its associated Azure AD client is deleted.
Consequently, the previous client ID used will no longer be available.

If the application is re-deployed, the client ID will have **a new and different value**. 
Generally speaking, your application nor its consumers should not depend on or hard code the value of a client ID when 
acquiring tokens - see [scopes](concepts.md#scopes).

### Prevent Deletion

Sometimes you will want to prevent the deletion of the client, e.g. if your client has had a manual set up of additional 
Microsoft Graph permissions beyond the standard set.

If you want to prevent deletion of the client, add the following annotation to your `nais.yaml` manifest:

```yaml hl_lines="7"
apiVersion: nais.io/v1alpha1
kind: Application
metadata:
  name: myapplication
  namespace: myteam
  annotations:
    azure.nais.io/preserve: "true"
```

If you decide that the client should be removed at a later point, remove the annotation from the spec.
