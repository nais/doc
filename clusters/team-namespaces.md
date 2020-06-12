# Team namespaces

A namespace per team is automatically created in every NAIS cluster both on-prem and in GCP. 
Namespaces are created based on the contents of [teams.yaml](https://github.com/navikt/teams/blob/master/teams.yml) in [navikt/teams repo](https://github.com/navikt/teams/). 

The namespace has the same name as the `name` field i `teams.yaml`

Using team namespaces instead of shared namespaces has several advantages: 
- Team members have full admin access in that namespace. This includes `kubectl` commands like `scale`, `port-forward`, `exec` etc. 
- Support for [Kubernetes native secrets](https://kubernetes.io/docs/concepts/configuration/secret/) as an alternative to Vault. 
- People from other teams cannot read native secrets in your team's namespace
- People from other teams does not have access to your team's namespace. This prevents accidental changes or removal of Kubernetes resources used by your team. 
- Google Cloud Platform (GCP) only supports team namespaces. Migrating your application to a team namespace now makes it easier to move from on-prem to GCP later.
- No longer forces use of the `nais.io/Application` abstraction. If `nais.io/Application` doesn't support your requirements, or you simply prefer handling these resources yourself, you are free to do so.

## Service Discovery in Kubernetes

Applications deployed to Kubernetes are exposed through a service. This is an address that allows for direct communication 
within a Kubernetes cluster without having to go through an external ingress or load balancer. 

Services available can be viewed with `kubectl get service` or shorthand `kubectl get svc`. The service name 
is the same in both dev and prod clusters. This allows for simpler configuration. 

### Google Cloud Platform

The full hostname of a service on GCP follows this format:

```
http://<service-name>.<namespace>.svc.cluster.local
```

### On-prem

The full hostname of a service on-prem follows this format:

```
http://<service-name>.<namespace>.svc.nais.local
```

### Short names

You often won't need to use the full hostname to contact another service.

If you’re addressing a service in the same namespace, you can use just the service name to contact it:

```
http://<another-service>
```

If the service exists in a different namespace, you must add the appropriate namespace:

```
http://<another-service>.<another-namespace>
```

{% hint style="info" %}
**Note for on-prem**

If your application has [webproxy](../nais-application/manifest.md#specwebproxy) enabled, 
you should use the full hostname for all service discovery calls.

This is to ensure that your application does not attempt to perform these in-cluster calls through the proxy,
as the environment variable `NO_PROXY` includes `*.local`.
{% endhint %}

## On-prem migration to team namespaces

Migrating an application to a team namespace is done by changing the [namespace](../nais-application/manifest.md#metadatanamespace)
field in the naiserator yaml file and redeploying the app.

For example, if you're migrating `my-app` from the `default` namespace to a namespace called `my-team`, 
your yaml previously looked like this:

```yaml
apiVersion: "nais.io/v1alpha1"
kind: "Application"
metadata:
  name: my-app
  namespace: default
```

it should instead look like this:

```yaml
apiVersion: "nais.io/v1alpha1"
kind: "Application"
metadata:
  name: my-app
  namespace: my-team
```

{% hint style="warning" %}
**Reminder**

Remove the application from the old namespace when you have finished migrating.

```bash
kubectl delete app <app-name> -n <old-namespace>
```
{% endhint %}

If your application uses Vault, ensure that access to Vault secrets for the team namespace is set up.
Refer to [Vault iac documentation](https://github.com/navikt/vault-iac/blob/master/doc/getting-started.md#a-more-advanced-example-1) for details.

There are a few more steps to consider if you are integrating with other rest- or webservices. 

### Integration via ingress or BigIP 

If you are calling other services through a Kubernetes ingress or BigIP such as:

- https://myapp.nais.adeo.no 
- https://myapp.adeo.no 
- https://app.adeo.no/myapp
- https://modapp.adeo.no/myapp 

no changes are required. 

Service calls via api-gateway or service-gateway will also work without any changes.

### Integration via Kubernetes service discovery

If you're migrating `my-app` from the `default` namespace to a namespace called `my-team`, calls to other apps that 
are still in the `default` namespace will not work without modifying the url. 

For example, calls to `http://<another-app-in-default-namespace>` will fail to resolve.

{% hint style="danger" %}
Check with your consumers to ensure that they update their URLs if they use service discovery to reach your application.
{% endhint %}

Example:

The application `my-app` is deployed to the `default` namespace. 
The service discovery URL for the app is then:

```
http://my-app.default.svc.nais.local
```

If the application is moved to the `my-team` namespace, the service discovery URL is now:

```
http://my-app.my-team.svc.nais.local
```
