# Ingress parameters

You can tweak the Ingress configuration by specifying certain Kubernetes annotations in your app spec.
A list of supported variables are specified in the
[Nginx ingress documentation](https://kubernetes.github.io/ingress-nginx/user-guide/nginx-configuration/annotations/).

As the Nginx ingress documentation states, these parameters are set on the Ingress object.
However, Naiserator will copy these parameters from your Application spec.

## Custom max body size

For nginx, an `413` error will be returned to the client when the size in a request exceeds the maximum allowed size of the client request body. 

```
metadata:
  annotations:
    nginx.ingress.kubernetes.io/proxy-body-size: 8m
```

## Custom proxy buffer size

Sets the size of the buffer proxy_buffer_size used for reading the first part of the response received from the proxied server. By default proxy buffer size is set as `4k`

```
metadata:
  annotations:
    nginx.ingress.kubernetes.io/proxy-buffer-size: "8k"
```

## Custom timeouts

In some scenarios is required to have different values for varisous timeouts. To allow this we provide parameters that allows this customization:

* `nginx.ingress.kubernetes.io/proxy-connect-timeout`
* `nginx.ingress.kubernetes.io/proxy-send-timeout`
* `nginx.ingress.kubernetes.io/proxy-read-timeout`
* `nginx.ingress.kubernetes.io/proxy-next-upstream`
* `nginx.ingress.kubernetes.io/proxy-next-upstream-timeout`
* `nginx.ingress.kubernetes.io/proxy-next-upstream-tries`
* `nginx.ingress.kubernetes.io/proxy-request-buffering`

Note: All timeout values are unitless and in seconds e.g. `nginx.ingress.kubernetes.io/proxy-read-timeout: "120"` sets a valid 120 seconds proxy read timeout.

## WebSockets Support

Support for websockets is provided by nginx ingress controller out of the box. No special configuration required.

The only requirement to avoid the close of connections is the increase of the values of `proxy-read-timeout` and `proxy-send-timeout`.

The default value of this settings is `60 seconds`.

A more adequate value to support websockets is a value higher than one hour (`3600`).

```
apiVersion: nais.io/v1alpha1
kind: Application
metadata:
  name: myapplication
  namespace: myteam
  annotations:
    nginx.ingress.kubernetes.io/proxy-read-timeout: "600"
    nginx.ingress.kubernetes.io/proxy-send-timeout: "600"
spec:
  ...
```

## Full ingress example

```
apiVersion: nais.io/v1alpha1
kind: Application
metadata:
  name: myapplication
  namespace: myteam
  annotations:
    nginx.ingress.kubernetes.io/proxy-body-size: "256M"
    nginx.ingress.kubernetes.io/proxy-buffer-size: "8k"
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
