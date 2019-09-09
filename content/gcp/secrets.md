Native Kubernetes Secrets (only available in GCP)
=================================================

When running in GCP, you also have the option of using [Kubernetes `Secrets`](https://kubernetes.io/docs/concepts/configuration/secret) directly instead of (or in combination with) Vault.

To get started using this, you simply [create your secret(s)](https://kubernetes.io/docs/concepts/configuration/secret/#creating-your-own-secrets). This can be either key-value pairs or files and can be exposed to the application as environment variables or files. 

## Example

Create your secret
```
$ kubectl create secret generic my-secret --from-literal=key1=supersecret
```

```
secret/my-secret created
```

Refer to `my-secret` in `nais.yaml`
```yaml
spec:
  secrets:
    - name: my-secret
```

And you're done. When your application is running, the environment variable `key1` will have the value `supersecret`.

See the official [Kubernetes documentation](https://kubernetes.io/docs/concepts/configuration/secret) or by running `kubectl create secret generic --help` for more details on creating and managing your secrets.
