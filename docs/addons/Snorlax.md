# Snorlax

Snorlax helps reduce resource usage by tracking requests on ingresses and scaling apps up/down based on timeouts and requests.
It will scale up apps when they've got 0 replicas and receives traffic, and will set replicas to 0 after a given idle time.

## Enable Snorlax for you application

Add the following `annotations` to your `nais.yaml`:

```
snorlax.nais.io/enabled: true
```

A more complete example:

```yaml
apiVersion: nais.io/v1alpha1
kind: Application
metadata:
  annotations:
    snorlax.nais.io/enabled: true
  name: myapplication
  namespace: myteam
spec:
  ...
```
