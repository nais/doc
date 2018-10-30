# Experimenting with istio rbac policies

## We have globally configured istio to enforce `MUTUAL_TLS` in our istio config:
```
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

```
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
```
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
```
apiVersion: "rbac.istio.io/v1alpha1"
kind: RbacConfig
metadata:
  name: default
spec:
  mode: 'ON_WITH_INCLUSION'
  inclusion:
    namespaces: ["irbac"]
```
Note that the name of the policy must be default.
The  RbacConfig is global and determines which namespaces has istio enforcement enabeled.

By default all traffic should be denied from all pods, even though they have istio enabled, due to the globally configured trafficPolicy set to `ISTIO_MUTUAL`
<span style="background-color: #FFFF00"> This does not work if the service hasn't got the `-name:` field set on the port specification array.</span>

## We want to allow certain services to communicate with eachother:

We do this by defining a
