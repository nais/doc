# Access Policy

!!! info
    Network policies are only applied in GCP clusters.
    
    However, inbound rules for authorization in the context of [_TokenX_](../security/auth/tokenx.md) or [_Azure AD_](../security/auth/azure-ad/README.md) apply to all clusters.

## Access Policy

Access policies express which applications and services you are able to communicate with, both inbound and outbound. The default policy is to **deny all incoming and outgoing traffic** for your application, meaning you must be conscious of which services/application you consume, and who your consumers are.

!!! warning
    The Access policies only apply when communicating interally within the cluster with [service discovery](../clusters/service-discovery.md).
    
    Outbound requests to ingresses are regarded as external hosts, even if these ingresses exist in the same cluster.
    
    Analogously, inbound access policies are thus _not_ enforced for requests coming through exposed ingresses.

### Inbound rules

Inbound rules specifies what other applications _in the same cluster_ your application receives traffic from.

#### Receive requests from other app in the same namespace

For app `app-a` to be able to receive incoming requests from `app-b` in the same cluster and the same namespace, this specification is needed for `app-a`:

```yaml
apiVersion: "nais.io/v1alpha1"
kind: "Application"
metadata:
  name: app-a
...
spec:
  ...
  accessPolicy:
    inbound:
      rules:
        - application: app-b
```

#### Receive requests from other app in the another namespace

For app `app-a` to be able to receive incoming requests from `app-b` in the same cluster but another namespace \(`othernamespace`\), this specification is needed for `app-a`:

```yaml
apiVersion: "nais.io/v1alpha1"
kind: "Application"
metadata:
  name: app-a
...
spec:
  ...
  accessPolicy:
    inbound:
      rules:
        - application: app-b
          namespace: othernamespace
```

### Outbound rules

Inbound rules specifies what other applications your application receives traffic from. `spec.accessPolicy.outbound.rules` specifies which applications in the same cluster to open for. To open for external applications, use the field `spec.accessPolicy.outbound.external`.

#### Send requests to other app in the same namespace

For app `app-a` to be able to send requests to `app-b` in the same cluster and the same namespace, this specification is needed for `app-a`:

```yaml
apiVersion: "nais.io/v1alpha1"
kind: "Application"
metadata:
  name: app-a
...
spec:
  ...
  accessPolicy:
    outbound:
      rules:
        - application: app-b
```

#### Send requests to other app in the another namespace

For app `app-a` to be able to send requests requests to `app-b` in the same cluster but in another namespace \(`othernamespace`\), this specification is needed for `app-a`:

```yaml
apiVersion: "nais.io/v1alpha1"
kind: "Application"
metadata:
  name: app-a
...
spec:
  ...
  accessPolicy:
    outbound:
      rules:
        - application: app-b
          namespace: othernamespace
```

#### External services

In order to send requests to services outside of the cluster, `external.host` is needed:

```yaml
apiVersion: "nais.io/v1alpha1"
kind: "Application"
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

**Global Service Entries**

There are some services that are automatically added to the mesh in [dev-gcp](https://github.com/navikt/nais-yaml/blob/master/vars/dev-gcp.yaml) and [prod-gcp](https://github.com/navikt/nais-yaml/blob/master/vars/prod-gcp.yaml) (search for `global_serviceentries`).

### Advanced: Resources created by Naiserator

The previous application manifest examples will create Kubernetes Network Policies.

#### Kubernetes Network Policy

**Default policy**

Every app created will have this default network policy that allows traffic to Linkerd and kube-dns. 
It also allows incoming traffic from the Linkerd control plane and from tap and prometheus in the linkerd-viz namespace. This is what enables monitoring via the linkerd dashboard.
These policies will be created for every app, also those who don't have any access policies specified.

```yaml
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
              linkerd.io/is-control-plane: "true"
        - namespaceSelector: {}
          podSelector:
            matchLabels:
              k8s-app: kube-dns
        - ipBlock:
            cidr: 0.0.0.0/0
            except:
              - 10.6.0.0/15
              - 172.16.0.0/12
              - 192.168.0.0/16
  ingress:
    - from:
        - namespaceSelector:
            matchLabels:
              linkerd.io/is-control-plane: "true"
    - from:
        - namespaceSelector:
            matchLabels:
              linkerd.io/extension: viz
          podSelector:
            matchLabels:
              component: tap
    - from:
        - namespaceSelector:
            matchLabels:
              linkerd.io/extension: viz
          podSelector:
            matchLabels:
              component: prometheus
  podSelector:
    matchLabels:
      app: appname
  policyTypes:
    - Ingress
    - Egress

```

**Kubernetes network policies**

The applications specified in `spec.accessPolicy.inbound.rules` and `spec.accessPolicy.outbound.rules` will append these fields to the default Network Policy:

```yaml
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

!!! info
    Note that for namespace match labels to work, the namespaces must be labeled with `name: namespacename`.

    `kube-system` should be labeled accordingly for the default rule that allows traffic to `kube-dns`, but in GCP, the label is removed by some job in regular intervals...

