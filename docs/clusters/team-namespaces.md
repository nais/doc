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
