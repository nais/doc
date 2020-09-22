# Google Secrets Manager

You may store secrets in [Google Secrets Manager] as an alternative to the other offered solutions. Note that this is currently only offered as a secure storage of your secrets for your team. 

## Status

Currently, NAIS applications cannot read these secrets. An integration that allows one-way synchronization of secrets in Secrets Manager to [Kubernetes Secrets] in GCP is planned by the end of 2020.

## Getting started
Start at the [GCP Console] page and refer to the [documentation][Secrets Manager Documentation] for guides and how-tos on creating and managing secrets.

[GCP Console]: https://console.cloud.google.com/security/secret-manager
[Google Secrets Manager]: https://cloud.google.com/secret-manager
[Kubernetes Secrets]: ./kubernetes-secrets.md
[Secrets Manager Documentation]: https://cloud.google.com/secret-manager/docs
