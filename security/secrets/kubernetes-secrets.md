# Kubernetes Secrets

When running an application in a team namespace, [Kubernetes Secrets] can be used directly instead of Vault.

To get started using this, simply [create the secrets]. A secret can be either key-value pairs or files, and can be
exposed to the application as environment variables or files.

## Example

Creating a secret

```bash
$ kubectl create secret generic my-secret --from-literal=key1=supersecret
secret/my-secret created
```

{% hint style="info" %}	
The kubectl plugin [kubectl-modify-secret] is recommended if you need to modify the secret contents after creation.	
{% endhint %}

Exposing `my-secret` as environment variables to the application by referring to it in `nais.yaml`

```yaml
spec:
  envFrom:
    - secret: my-secret
```

That's it! When the application is running, the environment variable `key1` will have the value `supersecret`.

Alternatively, if the secret should have their contents mounted into the containers as files:

```yaml
spec:
  filesFrom:
    - secret: my-secret
```

The secret is then exposed under the path specified by `spec.filesFrom[].mountPath` (default `/var/run/secrets`). 
For this example it is available at `/var/run/secrets/key1`.

See the official [Kubernetes documentation][Kubernetes secrets] or by running `kubectl create secret generic --help`
for more details on creating and managing your secrets.

[Kubernetes Secrets]: https://kubernetes.io/docs/concepts/configuration/secret
[create the secrets]: https://kubernetes.io/docs/concepts/configuration/secret/#creating-your-own-secrets
[kubectl-modify-secret]: https://github.com/rajatjindal/kubectl-modify-secret
