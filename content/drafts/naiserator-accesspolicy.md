# Design draft for `nais.io/Application` access policies

We want to provide the applications with a coarse grained access control mechanism as a platform capability.

This can be implemented using a combination of Kubernetes `NetworkPolicies` and Istio's RBAC policy (`ServiceRole` and `ServiceRolebinding`)

To begin with, we want each application to specify which other applications should be able to communicate with them. 

For instance, if we have four applications `a`, `b`, `c` and `d`, and `d` wants to allow `a`, `b` and `c` to communicate with it and `c` runs in a different namespace.
`d`'s `nais.io/Application` would look like this: 

```
...
metadata:
  name: d
  namespace: default
spec: 
  ...
  accessPolicy:
    inbound:
      - application: a
        namespace: default # optional, defaults to 'metadata.namespace'
      - application: b
      - application: c
        namespace: othernamespace 
...
```


When this configuration is applied, we will create the following resources:

### NetworkPolicy

```
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: d
  namespace: default
spec:
  podSelector:
    matchLabels:
      app: d
  ingress:
  - from:
    - namespaceSelector:
        matchLabels:
          name: default
      podSelector:
        matchLabels:
          app: a
    - namespaceSelector:
        matchLabels:
          name: default
      podSelector:
        matchLabels:
          app: b
    - namespaceSelector:
        matchLabels:
          name: othernamespace
      podSelector:
        matchLabels:
          app: c
```

### Istio RBAC

```
apiVersion: "rbac.istio.io/v1alpha1"
kind: ServiceRole
metadata:
  name: d
  namespace: default
spec:
  rules:
  - services: ["d.default.svc.cluster.local"]
    methods: ["*"]
apiVersion: "rbac.istio.io/v1alpha1"
---
apiVersion: "rbac.istio.io/v1alpha1"
kind: ServiceRoleBinding
metadata:
  name: d
  namespace: default
spec:
  subjects:
  - user: "cluster.local/ns/default/sa/a"
  - user: "cluster.local/ns/default/sa/b"
  - user: "cluster.local/ns/othernamespace/sa/c"
  roleRef:
    kind: ServiceRole
    name: "d"
```

### Prerequisites:

- Istio mTLS is enabled for the namespace used
- Istio RBAC is enabled for the namespace used
- Network policies is available
- Namespace needs to have label name: <namespace-name>
- Default deny rule is applied to the cluster 
- ServiceAccount is created and mounted for each deployment (same name as the deployment)
- The `Service` object needs to have ports[].name set
- Kubernetes >= v1.11

Note: has not been tested with this exact `NetworkPolicy`. With current latest version in GKE, we are limited to granting access to a specific application in the same namespace. If the application runs in a different namespace, we can only grant access to the entire namespace due to limitations in 1.10. This is fixed in 1.11.
