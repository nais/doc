# Experimenting with istio rbac policies

## We have globally configured istio to enforce `MUTUAL_TLS` in our istio config:

```text
apiVersion: networking.istio.io/v1alpha3
kind: DestinationRule
metadata:
  labels:
    app: istio-security
  name: default
  namespace: istio-system
spec:
  host: '*.local'
  trafficPolicy:
    tls:
      mode: ISTIO_MUTUAL
```

```text
apiVersion: v1
kind: Service
metadata:
  labels:
    app: {{ app }}
  name: {{ app }}
  namespace: {{ ns }}
spec:
  ports:
  - name: http
    port: 80
    protocol: TCP
    targetPort: 8080
  selector:
    app: {{ app }}
  type: ClusterIP
```

## We need to enable istio sidecar injection in our designated namespace:

```text
apiVersion: v1
kind: Namespace
metadata:
  name: irbac
  labels:
    istio-injection: enabled
spec:
  finalizers:
  - kubernetes
```

## Then we need to enable istio rbac policies for each individual namespace:

```text
apiVersion: "rbac.istio.io/v1alpha1"
kind: RbacConfig
metadata:
  name: default
spec:
  mode: 'ON_WITH_INCLUSION'
  inclusion:
    namespaces: ["irbac"]
```

Note that the name of the policy must be default. The RbacConfig is global and determines which namespaces has istio enforcement enabeled.

By default all traffic should be denied from all pods, even though they have istio enabled, due to the globally configured trafficPolicy set to `ISTIO_MUTUAL`  This does not work if the service hasn't got the `-name:` field set on the port specification array.

## We want to allow certain services to communicate with eachother:

We do this by defining a ServiceRole and ServiceRoleBinding

```text
apiVersion: "rbac.istio.io/v1alpha1"
kind: ServiceRole
metadata:
  name: b-viewer
  namespace: default
spec:
  rules:
  - services: ["b.default.svc.cluster.local"]
    methods: ["*"]
---
apiVersion: "rbac.istio.io/v1alpha1"
kind: ServiceRoleBinding
metadata:
  name: bind-b-viewer
  namespace: default
spec:
  subjects:
  - user: "*"
  roleRef:
    kind: ServiceRole
    name: "b-viewer"
```

Here we allow access to a specific service from any sources Make sure the ServiceRole and ServiceRoleBinding is created in the same namespace as the destination service. We tested creating the same `ServiceRole` and `ServiceRolebinding` in the default namespace, still pointing at the service in irbac, and this did not work.

In order to make a more spesific policy where we say that only app a is allowed to talk to app b, we have to create the following policy:

```text
apiVersion: "rbac.istio.io/v1alpha1"
kind: ServiceRole
metadata:
  name: b-viewer
  namespace: irbac
spec:
  rules:
  - services: ["b.irbac.svc.cluster.local"]
    methods: ["GET"]
apiVersion: "rbac.istio.io/v1alpha1"
---
kind: ServiceRoleBinding
metadata:
  name: bind-b
  namespace: irbac
spec:
  subjects:
  - user: "cluster.local/ns/irbac/sa/a"
  roleRef:
    kind: ServiceRole
    name: "b-viewer"
```

For this to work, a service account named `a` must exist in the namespace, and it must be bound to `a`'s PodSpec.

```text
kubectl create serviceaccount a
```

add the following to app `a`'s PodSpec

```text
serviceAccount: a
serviceAccountName: a
```

To verify that the Pod has got the correct service account token, exec into the pod and check `/var/run/secrets/kubernetes.io/token` \(decode at jwt.io\) The service account is in the sub field: "sub": "system:serviceaccount:irbac:a"

