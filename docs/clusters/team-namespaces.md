# Team namespaces

A namespace per team is automatically created in every NAIS cluster both on-prem and in GCP. Namespaces are created based on the contents of [teams.yaml](https://github.com/navikt/teams/blob/master/teams.yml) in [navikt/teams repo](https://github.com/navikt/teams/).

The namespace has the same name as the `name` field i `teams.yaml`

Using team namespaces instead of shared namespaces has several advantages:

* Team members have full admin access in that namespace. This includes `kubectl` commands like `scale`, `port-forward`, `exec` etc. 
* Support for [Kubernetes native secrets](https://kubernetes.io/docs/concepts/configuration/secret/) as an alternative to Vault. 
* People from other teams cannot read native secrets in your team's namespace
* People from other teams does not have access to your team's namespace. This prevents accidental changes or removal of Kubernetes resources used by your team. 
* Google Cloud Platform \(GCP\) only supports team namespaces. Migrating your application to a team namespace now makes it easier to move from on-prem to GCP later.
* No longer forces use of the `nais.io/Application` abstraction. If `nais.io/Application` doesn't support your requirements, or you simply prefer handling these resources yourself, you are free to do so.

## On-prem migration to team namespaces

Migrating an application to a team namespace is done by changing the `.metadata.namespace` field in the `nais.yaml` file and redeploying the app.

For example, if you're migrating `my-app` from the `default` namespace to a namespace called `my-team`, your yaml previously looked like this:

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

!!! warning "Reminder"
    Remove the application from the old namespace when you have finished migrating.

    ```bash
    kubectl delete app <app-name> -n <old-namespace>
    ```


If your application uses Vault, make sure the application is registered under the correct team in [Vault IAC](https://github.com/navikt/vault-iac/).

There are a few more steps to consider if you are integrating with other rest- or webservices.

### Integration via ingress or BigIP

If you are calling other services through a Kubernetes ingress or BigIP such as:

* [https://myapp.nais.adeo.no](https://myapp.nais.adeo.no) 
* [https://myapp.adeo.no](https://myapp.adeo.no) 
* [https://app.adeo.no/myapp](https://app.adeo.no/myapp)
* [https://modapp.adeo.no/myapp](https://modapp.adeo.no/myapp) 

no changes are required.

Service calls via api-gateway or service-gateway will also work without any changes.

### Integration via [Kubernetes service discovery](service-discovery.md)

When migrating your application from either the `default` namespace or from a environment namespace (e.g. t1, q1 etc.), the service URL will change and consequently break your consumer integrations.
This can be mitigated during a migration phase by creating an [`ExternalName`-service](https://kubernetes.io/docs/concepts/services-networking/service/#externalname) in the namespace you are migrating from, that points to the new service in the team namespace.

#### Example

When migrating your application `my-app` from the `default` namespace to `my-teamnamespace`, you can create the following `Service` in the default namespace to keep the previous service URL, and allow for a seamless migration.

```yaml
apiVersion: v1
kind: Service
metadata:
  name: my-app
  namespace: default
spec:
  type: ExternalName
  externalName: my-app.my-teamnamespace.svc.nais.local
```

This will create a CNAME DNS record that will resolve `my-app.default.svc.nais.local` as `my-app.my-teamnamespace.svc.nais.local`
