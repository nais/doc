---
description: Access policies is only enabled in our in-cloud clusters.
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
For app `app-a` to be able to receive incoming requests from `app-b` in the same cluster but another namespace (`othernamespace`), this specification is needed for `app-a`:

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
Inbound rules specifies what other applications your application receives traffic from. `spec.accessPolicy.outbound.rules` specifies which applications in the same cluster to open for. To open for external applications, use the field `spec.accessPolicy.outbound.external`. 

### Send requests to other app in the same namespace
For app `app-a` to be able to send requests to `app-b` in the same cluster and the same namespace, this specification is needed for `app-a`:

```
metadata:
  name: app-a
...
spec:
  ...
  accessPolicy:
    outbound:
      rules:
        application: app-b
```


### Send requests to other app in the another namespace
For app `app-a` to be able to send requests requests to `app-b` in the same cluster but in another namespace (`othernamespace`), this specification is needed for `app-a`:

```
metadata:
  name: app-a
...
spec:
  ...
  accessPolicy:
    outbound:
      rules:
        application: app-b  
        namespace: othernamespace
```

### External services
In order to send requests to services outside of the cluster, `external.host` is needed:

```
metadata:
  name: app-a
...
spec:
  ...
  accessPolicy:
    outbound:
      external: 
        - host: www.external-application.com
```



## Advanced: Resources created by Naiserator

The example above will create both Kubernetes Network Policies and Istio resources.


### Kubernetes Network Policy

### Default policy
Every app created will have this default network policy that allows traffic from Istio pilot and mixer, as well as kube-dns.

```
apiVersion: extensions/v1beta1
kind: NetworkPolicy
metadata:
  labels:
    app: appname
    team: teamname
  name: appname
  namespace: teamname
spec:
  egress:
  - to:
    - namespaceSelector:
        matchLabels:
          name: istio-system
      podSelector:
        matchLabels:
          istio: pilot
    - namespaceSelector:
        matchLabels:
          name: istio-system
      podSelector:
        matchLabels:
          istio: mixer
    - namespaceSelector: {}
      podSelector:
        matchLabels:
          k8s-app: kube-dns
    - ipBlock:
        cidr: 0.0.0.0/0
        except:
        - 10.0.0.0/8
        - 172.16.0.0/12
        - 192.168.0.0/16
  podSelector:
    matchLabels:
      app: appname
  policyTypes:
  - Egress
```

### Kubernetes network policies
The applications specified in `spec.accessPolicy.inbound.rules` and `spec.accessPolicy.outbound.rules` will append these fields to the default Network Policy:

```
apiVersion: extensions/v1beta1
kind: NetworkPolicy
...
spec:
  egress:
  - to:
    ...
    - namespaceSelector:
        matchLabels:
          name: othernamespace
      podSelector:
        matchLabels:
          app: app-b
    - podSelector:
        matchLabels:
          app: app-b  
  - from:
    - namespaceSelector:
        matchLabels:
          name: othernamespace
      podSelector:
        matchLabels:
          app: app-b
    - podSelector:
        matchLabels:
          app: app-b    
  podSelector:
    matchLabels:
      app: appname
  policyTypes:
  - Egress
  - Ingress
```

  


## Istio Resources

The policies from `spec.accessPolicy` will in addition create these Istio-resources:
- ServiceRole and ServiceRoleBinding
- ServiceEntry

In the cloud `spec.ingresses` will, instead of Kubernetes Ingress objects, create the Istio-resource:
- VirtualService

