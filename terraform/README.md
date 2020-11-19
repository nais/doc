# Terraforming doc.nais.io's GCP bucket and HTTPs webserver

## How to extract access token for created service account
1. First assert that the service account exists:
   `gcloud iam service-accounts list --filter doc-nais-io-bucket-write-sa@aura-prod-d7e3.iam.gserviceaccount.com`
2. Then create new key:
   `gcloud iam service-accounts keys create $(pwd)/sa-key.json --iam-account=doc-nais-io-bucket-write-sa@aura-prod-d7e3.iam.gserviceaccount.com`
3. Use `gcloud iam service-accounts keys list` to ensure you delete the previous one (if there was one).
4. Go to github repo and add contents of `sa-key.json` to `GCP_SERVICEACCOUNT_KEY_FOR_DOC_NAIS_IO_BUCKET` secret.

## Things went wrong when we attempted to edit FQDN
If you edit URL/certificates, (at the time of git commit writing) you can either:
1. Leverage `terraform destroy` before `terraform apply`.
2. Read up on [relevant terraform doc](https://registry.terraform.io/providers/hashicorp/google/latest/docs/resources/compute_ssl_certificate) (should be already fixed/implemented).

This due to terraform not applying resources in correct order - when certificate changes require a cascading delete/edit.
