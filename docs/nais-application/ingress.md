# Ingress parameters

!!! info
    Ingress parameter customization is enabled for GCP clusters only.

You can tweak the Ingress configuration by specifying certain Kubernetes annotations in your app spec.
A list of supported variables are specified in the
[Nginx ingress documentation](https://kubernetes.github.io/ingress-nginx/user-guide/nginx-configuration/annotations/).

As the Nginx ingress documentation states, these parameters are set on the Ingress object.
However, Naiserator will copy these parameters from your Application spec.

## Example

```
apiVersion: nais.io/v1alpha1
kind: Application
metadata:
  name: myapplication
  namespace: myteam
  annotations:
    nginx.ingress.kubernetes.io/proxy-body-size: "256M"
    nginx.ingress.kubernetes.io/proxy-read-timeout: "300"
spec:
  service:
    protocol: http
  ingresses:
    - https://myapplication.nav.no
```

This will result in an ingress with:

```
apiVersion: extensions/v1beta1
kind: Ingress
metadata:
  name: myapplication-gw-nav-no-abcd1234
  namespace: myteam
  annotations:
    nginx.ingress.kubernetes.io/backend-protocol: "HTTP"    # from ".service.protocol"
    nginx.ingress.kubernetes.io/use-regex: "true"           # this is always on
    nginx.ingress.kubernetes.io/proxy-body-size: "256M"     # copied from annotations
    nginx.ingress.kubernetes.io/proxy-read-timeout: "300"   # copied from annotations
```
