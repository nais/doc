# Team namespaces

A namespace per team is automatically created in every nais cluster both on-prem and in GCP. 
Namespaces are created based on the contents of [teams.yaml](https://github.com/navikt/teams/blob/master/teams.yml) in [navikt/teams repo](https://github.com/navikt/teams/). 

The namespace has the same name as the `name` field i teams.yaml

Using team namespaces instead of shared namespaces has several advantages: 
- Team members have full admin access in that namespace. This includes `kubectl`commands like `scale`, `port-forward`, `exec` etc. 
- Support for [Kubernetes native secrets](https://kubernetes.io/docs/concepts/configuration/secret/) as an alternative to Vault. 
- People from other teams cannot read native secrets in your team's namespace
- People from other teams does not have access to your teams namespace. This prevents accidental changes or removal of Kubernetes resources used by your team. 
- Team namespaces is the only thing supported in Google Cloud Platform (GCP). Migrating to team namespaces now makes it easier to move from on-prem to GCP later. 
- No longer forces use of the nais.io/Application abstraction. If nais.io/Application doesn't support your requirements, or you simply prefer handling these resources yourself, you are free to do so.


## On-prem migration to team namespaces

Migrating an application to a team namespace is done by simply changing the namespace field in the naiserator yaml file and redeploying the app. 

---

**Note**

Remember to remove the app from the old namespace. 
``` bash
kubectl delete app <appName> -n <oldNamespace>
```

---



Also, remember to remove the app from the old namespace. 

```yaml
apiVersion: "nais.io/v1alpha1"
kind: "Application"
metadata:
  name: myApp
  namespace: aTeam
  ```

However there are a few more steps to consider if you are integrating with other rest- or webservices. 

### Integration via ingress or BigIP 
If you are calling other services through a Kubernetes ingress or BigIP such as myapp.nais.adeo.no, myapp.adeo.no app.adeo.no/myapp or modapp.adeo.no/myapp no changes are required. 

Service calls via api-gateway or service-gateway will also work without any changes

### Integration via Kubernetes service discovery

Applications deployed to Kubernetes exposes a service. This is an adress that allows for direct communication within a Kubernetes cluster without having to go through an external ingress or load balancer. 

Services available can be viewed with `kubectl get service` or shorthand `kubectl get svc`. The service name is the same in both dev and prod clusters. This allows for simpler configuration. 

Integrating with other applications in the same namespace via servicediscovery is achieved by simply using `http://servicename` in your config. For example `http://myapp`

If you're migrating myapp from the default namespace to a namespace called "aTeam", calls to other apps that are still in the default namespace will not work without modifying the url. For example `http://anotherAppStillInDefaultNamespace` will fail. 

URLs have to be updated to this format:`http://<servicename>.<namespace>.cluster.local`. For example `http://anotherAppStillInDefaultNamespace.default.cluster.local`

---
**NOTE**

When migrating an application to a team namespace, be sure to let your consumers know. 
All consuming applications that are using service discovery also needs to update their config. 

For example is myApp moves to the aTeam namespace, all consumer has to change their service discovery url to `http://myapp.ateam.svc.cluster.local

---

