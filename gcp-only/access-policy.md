# Access Policy

In GCP we're operating in a [zero-trust](zero-trust.md) environment.
This means that all traffic to your application, both incoming and outgoing, is denied by default.
The only communication allowed is that which has explicitly expressed in your application's [accessPolicy](https://doc.nais.io/nais-application/manifest)

If your application, `a`, intends to communicate with application `b`, application `a` needs an access policy allowing the outbound traffic:
```
spec:
  accessPolicy:
    inbound: {}
    outbound: 
      rules:
        - application: b
```

Since application `b` does not currently have an accessPolicy allowing incoming traffic from application `a` the connection will be refused by application `b`
![](./_media/accesspolicy-1.png)

Once application `b` has added an inbound policy allowing application `a`, the communication is allowed
```
spec:
  accessPolicy:
    inbound:
      rules:
        - application: a
    outbound: {}
```
![](./_media/accesspolicy-2.png)

If your application needs to communicate with something outside the cluster, you will have to specify an outbound external rule to allow this traffic:

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
