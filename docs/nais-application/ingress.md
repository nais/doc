# Ingress parameters

!!! info
    Ingress parameter customization is enabled for GCP clusters only.

You can add these Kubernetes annotations to your app spec to customize Ingress behavior.

These parameters allow tweaking of many different variables. For a full list of
supported variables, see [Nginx ingress
documentation](https://kubernetes.github.io/ingress-nginx/user-guide/nginx-configuration/annotations/).

As the Nginx ingress documentation states, these parameters are set on the Ingress object.
However, Naiserator will copy these parameters from your Application spec.

## Example

```
kind: Application
apiVersion: v1alpha1
metadata:
  name: myapplication
  namespace: myteam
  annotations:
    nginx.ingress.kubernetes.io/proxy-body-size: "256M"
    nginx.ingress.kubernetes.io/proxy-read-timeout: "300"
```
