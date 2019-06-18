# Access policies

> Access policies is only enabled in some clusters. See which in our [cluster overview](../clusters/README.md).

If you are running your app in a cluster with access policies enabled you can define the access rules for your application.
If you define none, the policy will **default to deny all incoming and outgoing traffic**.

If you set `allow-all` to `true`, all traffic in the same namespace as the application will be allowed.


```
    inbound:
      rules:
        - application: app1 # allows access from application a in same namespace
        - application: app2
          namespace: q1 # optional, defaults to 'metadata.namespace'
        - application: app3
          namespace: t1
        - application: * # opens up for all inbound access from 't1' namespace
          namespace: t1 
    outbound:
      rules: 
        - application: app4
          namespace: t1
      external: # cluster external hosts application needs to access
        - host: www.external-application.com
```

To learn more about the resources created by naiserator from this specification, visit [istio-rbac]() and [networkpolicies]().