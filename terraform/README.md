# Terraforming doc.nais.io's GCP bucket and HTTPs webserver

## Things went wrong when we attempted to edit FQDN
If you edit URL/certificates, (at the time of git commit writing) you can either:
1. Leverage `terraform destroy` before `terraform apply`.
2. Read up on [relevant terraform doc](https://registry.terraform.io/providers/hashicorp/google/latest/docs/resources/compute_ssl_certificate) (should be already fixed/implemented).

This due to terraform not applying resources in correct order - when certificate changes require a cascading delete/edit.
