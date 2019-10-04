# Access Policy

On GCP, NAIS operates in a [zero-trust] environment. This means that all traffic to your application, both incoming and
outgoing, is denied by default. The only communication allowed is that which has explicitly expressed in your
application's [`accessPolicy`][accessPolicy].

## A minimal example

If application `a` intends to communicate with application `b`, application `a` needs an access policy allowing the
outbound traffic:

```
spec:
  accessPolicy:
    inbound: {}
    outbound:
      rules:
        - application: b
```

Since application `b` does not currently have an [access policy][accessPolicy] allowing incoming traffic from
application `a` the connection will be refused by application `b`.

![b refuses connections from a][access-1]

Once application `b` has added an inbound policy allowing application `a`, the communication is allowed.

```
spec:
  accessPolicy:
    inbound:
      rules:
        - application: a
    outbound: {}
```
![b accepts connections from a][access-2]

{% hint style="info" %}
Although the point of explicit expression has been previously stated, in this example application `a` cannot receive
data from application `b` (and application `b` cannot send data to application `a`). In order to achieve two-way
communication between the two applications, the [access policy][accessPolicy] for each application would need to allow
both inbound and outbound traffic to the opposite application.
{% endhint %}

## Communication to the outside world

If your application needs to communicate with something outside the cluster, you will have to specify an external rule
to allow this traffic. Here is an example with an application that intends to send data to `somewhere.else.com`.

```
spec:
  accessPolicy:
    inbound: {}
    outbound:
      rules:
        - application: b
      external:
        - host: somewhere.else.com
```

[zero-trust]: zero-trust.md
[accessPolicy]: ../nais-application/manifest.md#spec-accesspolicy-gcp-only
[access-1]: ./_media/accesspolicy-1.png
[access-2]: ./_media/accesspolicy-2.png
