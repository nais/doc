# Experimenting with kubernetes NetworkPolicies

## Starting with an implicit deny all ingress to pods in relevant namespace

```text
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: default-deny-all-ingress
  namespace: np
spec:
  policyTypes:
  - Ingress
  podSelector: {}
  egress: []
```

This will deny all traffic to all pods in namespace np from all sources.

## Allowing traffic from specific pods in the same namespace:

```text
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: allow-a-b
  namespace: np
spec:
  podSelector:
    matchLabels:
      app: a
  ingress:
  - from:
    - podSelector:
        matchLabels:
          app: b
```

Will allow traffic from all pods labelled `app: b` to the app labelled `app: a` in the `np` namespace

## Extending this network policy to allow traffic from other namespaces:

```text
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: allow-a-b
  namespace: np
spec:
  podSelector:
    matchLabels:
      app: a
  ingress:
  - from:
    - podSelector:
        matchLabels:
          app: b
    - namespaceSelector:
        matchLabels:
          name: othernamespace
```

will allow traffic from pods labelled `app: b` in the `np`namespace and _all_ pods in the `othernamespace`namespace

```text
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: allow-a-b
  namespace: np
spec:
  podSelector:
    matchLabels:
      app: a
  ingress:
  - from:
    - podSelector:
        matchLabels:
          app: b
    - namespaceSelector:
        matchLabels:
          name: othernamespace
      podSelector:
        matchLabels:
          app: c
```

Should in theory only allow for traffic from pods labelled `app: c` in the `othernamespace` namespace, however, this is only supported from kubernetes 1.11 onwards.

