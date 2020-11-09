# Access Policy

{% hint style="info" %}
network policies and istio authorization is only applied in GCP clusters.
{% endhint %}

## Access Policy

Access policies express which applications and services you are able to communicate with, both inbound and outbound. The default policy is to **deny all incoming and outgoing traffic** for your application, meaning you must be conscious of which services/application you consume, and who your consumers are.

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

There are some services that are automatically added to the mesh in [dev-gcp](https://github.com/navikt/nais-yaml/blob/master/vars/dev-gcp/global-serviceentries.yaml) and [prod-gcp](https://github.com/navikt/nais-yaml/blob/master/vars/prod-gcp/global-serviceentries.yaml)

### Advanced: Resources created by Naiserator

The previous application manifest examples will create both Kubernetes Network Policies and Istio resources.

#### Kubernetes Network Policy

**Default policy**

Every app created will have this default network policy that allows traffic from Istio pilot and mixer, as well as kube-dns. This policy will be created for every app, also those who don't have any access policies specified.

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

{% hint style="info" %}
Note that for namespace match labels to work, the namespaces must be labeled with `name: namespacename`.

`kube-system` should be labeled accordingly for the default rule that allows traffic to `kube-dns`, but in GCP, the label is removed by some job in regular intervals...
{% endhint %}

#### Istio Resources

The policies from `spec.accessPolicy` will in addition create these Istio-resources:

**ServiceRole and ServiceRoleBinding**

For Istio to allow request from `app-b` in the same namespace and in `othernamespace`, these resources will be created:

```yaml
apiVersion: rbac.istio.io/v1alpha1
kind: ServiceRole
metadata:
  labels:
    app: app-a
    team: my-team 
  name: app-a
  namespace: my-team
spec:
  rules:
  - methods:
    - '*'
    paths:
    - '*'
    services:
    - app-a.my-team.svc.cluster.local
```

```yaml
apiVersion: rbac.istio.io/v1alpha1
kind: ServiceRoleBinding
metadata:
  labels:
    app: app-a
    team: my-team
  name: app-a
  namespace: my-team
spec:
  roleRef:
    kind: ServiceRole
    name: app-a
  subjects:
  - user: cluster.local/ns/my-team/sa/app-b
  - user: cluster.local/ns/othernamespace/sa/app-b
```

**ServiceEntry**

`spec.accessRules.outbound.external` will create ServiceEntry:

```yaml
apiVersion: networking.istio.io/v1alpha3
kind: ServiceEntry
metadata:
  labels:
    app: app-a
    team: my-team
  name: app-a
  namespace: my-team
spec:
  hosts:
  - www.external-application.com
  location: MESH_EXTERNAL
  ports:
  - name: https
    number: 443
    protocol: HTTPS
  resolution: DNS
```

**VirtualService**

In the cloud `spec.ingresses` will create VirtualService instead of Ingress objects:

```yaml
apiVersion: networking.istio.io/v1alpha3
kind: VirtualService
metadata:
  labels:
    app: app-a
    team: my-team
  name: app-a-app-a-dev-gcp-nais-io
  namespace: my-team
spec:
  gateways:
  - istio-system/ingress-gateway-nais-io
  hosts:
  - my-app.dev-gcp.nais.io
  http:
  - route:
    - destination:
        host: app-a
        port:
          number: 80
        subset: ""
      weight: 100
```

