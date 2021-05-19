# Service Discovery in Kubernetes

Applications deployed to Kubernetes are exposed through a service. This is an address that allows for direct communication within a Kubernetes cluster without having to go through an external ingress or load balancer.

Services available can be viewed with `kubectl get service` or shorthand `kubectl get svc`. The service name is the same in both dev and prod clusters. This allows for simpler configuration.

## Google Cloud Platform

!!! warning
    Ensure that you've set up proper [access policies](../nais-application/access-policy.md) for your applications.

The full hostname of a service on GCP follows this format:

```text
http://<service-name>.<namespace>.svc.cluster.local
```

## On-prem

The full hostname of a service on-prem follows this format:

```text
http://<service-name>.<namespace>.svc.nais.local
```

## Short names

You often won't need to use the full hostname to contact another service.

If you’re addressing a service in the same namespace, you can use just the service name to contact it:

```text
http://<another-service>
```

If the service exists in a different namespace, you must add the appropriate namespace:

```text
http://<another-service>.<another-namespace>
```

!!! info "Note for on-prem"
    If your application has [webproxy](../nais-application/application.md#specwebproxy) enabled, you should use the full hostname for all service discovery calls.

    This is to ensure that your application does not attempt to perform these in-cluster calls through the proxy, as the environment variable `NO_PROXY` includes `*.local`.
