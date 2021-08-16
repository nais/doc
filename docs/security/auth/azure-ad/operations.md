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