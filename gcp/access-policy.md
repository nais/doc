# Access Policy

On GCP, NAIS operates in a [zero-trust](zero-trust.md) environment. This means that all traffic to your application, both incoming and outgoing, is denied by default. The only communication allowed is that which has explicitly expressed in your application's [`accessPolicy`](../nais-application/manifest.md#spec-accesspolicy-gcp-only).

## A minimal example

If application `a` intends to communicate with application `b`, application `a` needs an access policy allowing the outbound traffic:

```text
spec:
  accessPolicy:
    inbound: {}
    outbound:
      rules:
        - application: b
```

Since application `b` does not currently have an [access policy](../nais-application/manifest.md#spec-accesspolicy-gcp-only) allowing incoming traffic from application `a` the connection will be refused by application `b`.

![](../.gitbook/assets/accesspolicy-1.png)

Once application `b` has added an inbound policy allowing application `a`, the communication is allowed.

```text
spec:
  accessPolicy:
    inbound:
      rules:
        - application: a
    outbound: {}
```

![](../.gitbook/assets/accesspolicy-2.png)

{% hint style="info" %}
Although the point of explicit expression has been previously stated, in this example only application `a` can initiate communication with application `b` \(application `b` can answer application `a` if communication is initiated; regular TCP operation will work as expected, for instance\). In order to achieve two-way communication between the two applications, the [access policy](../nais-application/manifest.md#spec-accesspolicy-gcp-only) for each application would need to allow both inbound and outbound traffic to the opposite application.
{% endhint %}

## Communication to the outside world

If your application needs to communicate with something outside the cluster, you will have to specify an external rule to allow this traffic. Here is an example with an application that intends to initiate communication with `somewhere.else.com`.

```text
spec:
  accessPolicy:
    inbound: {}
    outbound:
      rules:
        - application: b
      external:
        - host: somewhere.else.com
```

