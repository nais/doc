By default, no applications have access to your API.
You must explicitly grant access to consumer applications.

```yaml title="app.yaml" hl_lines="5-12"
spec:
  accessPolicy:
    inbound:
      rules:
        - application: app-a

        - application: app-b
          namespace: other-namespace

        - application: app-c
          namespace: other-namespace
          cluster: other-cluster
```

The above configuration authorizes the following applications:

* application `app-a` running in the same namespace and same cluster as your application
* application `app-b` running in the namespace `other-namespace` in the same cluster
* application `app-c` running in the namespace `other-namespace` in the cluster `other-cluster`
