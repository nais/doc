# Team namespaces

A namespace per team is automatically created in every NAIS cluster both on-prem and in GCP.
Teams are managed using [NAIS console](https://console.nav.cloud.nais.io).

Features of team namespaces:

* Team members have full admin access in that namespace. This includes `kubectl` commands like `scale`, `port-forward`, `exec` etc. 
* Support for [Kubernetes native secrets](https://kubernetes.io/docs/concepts/configuration/secret/) as an alternative to Vault. 
* People from other teams cannot read native secrets in your team's namespace
* People from other teams does not have write access to your team's namespace. This prevents accidental changes or removal of Kubernetes resources used by your team. 
* No longer forces use of the `nais.io/Application` abstraction. If `nais.io/Application` doesn't support your requirements, or you simply prefer handling these resources yourself, you are free to do so.

Shared namespaces are no longer available as of December 2022.
