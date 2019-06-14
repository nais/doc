# Access policies

> Access policies is only enabled in some clusters. See which in our [cluster overview](../clusters/README.md).

If you are running your app in a cluster with access policies enabled you can define the access rules for your application.
If you define none, the policy will **default to deny all incoming and outgoing traffic**.

If you set `allow-all` to `true`, all traffic in the same namespace as the application will be allowed.


```
access-policies:
    ingress: 
        rules:
            - application: app1
              namespace: default    
    egress: 
        rules:  
            - www.testapp.no
```

To learn more about the resources created by naiserator from this specification, visit [istio-rbac]() and [networkpolicies]().