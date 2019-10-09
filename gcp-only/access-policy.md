---
description: Access policies is only enabled in our in-cloud clusters. See which in our [cluster overview](../README.md#nais-clusters).
--- 

# Access Policy


If you are running your app in a cluster with access policies enabled you can define the access rules for your application.
If you define none, the default policy will **deny all incoming and outgoing traffic** for your application.

This means that you have to know what other services your app is consuming and consumed by.

## Inbound rules

Inbound rules specifies what other applications *in the same cluster* your application receives traffic from.

### Receive requests from other app in the same namespace
For app `app-a` to be able to receive incoming requests from `app-b` in the same cluster and the same namespace, this specification is needed for `app-a`:

```
metadata:
  name: app-a
...
spec:
  ...
  accessPolicy:
    inbound:
      rules:
        application: app-b
```


### Receive requests from other app in the another namespace
For app `app-a` to be able to receive incoming requests from `app-b` in the same cluster but another namespace, this specification is needed for `app-a`:

```
metadata:
  name: app-a
...
spec:
  ...
  accessPolicy:
    inbound:
      rules:
        application: app-b
        namespace: othernamespace
```

## Outbound rules

### Rules

### External

## Ingresses

When running in a cluster with access policies enabled, the 

## Example


```
spec:
  ...
  accessPolicy:
    inbound:
      rules:
        - application: app1 # allows access from application a in same namespace
        - application: app2
          namespace: q1 # optional, defaults to 'metadata.namespace'
        - application: app3
          namespace: t1
    outbound:
      rules: 
        - application: app4
          namespace: t1
      external: # cluster external hosts application needs to access
        - host: www.external-application.com
```
