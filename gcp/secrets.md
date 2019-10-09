# Secrets

When running an application on GCP, [Kubernetes `Secrets`](https://kubernetes.io/docs/concepts/configuration/secret) can be used directly instead of \(or in combination with\) Vault.

To get started using this, simply [create the secrets](https://kubernetes.io/docs/concepts/configuration/secret/#creating-your-own-secrets). A secret can be either key-value pairs or files, and can be exposed to the application as environment variables or files.

## Example

Creating a secret

```bash
$ kubectl create secret generic my-secret --from-literal=key1=supersecret
secret/my-secret created
```

Referring to `my-secret` in `nais.yaml`

```yaml
spec:
  secrets:
    - name: my-secret
```

That's it! When the application is running, the environment variable `key1` will have the value `supersecret`.

See the official [Kubernetes documentation](https://kubernetes.io/docs/concepts/configuration/secret) or by running `kubectl create secret generic --help` for more details on creating and managing your secrets.

