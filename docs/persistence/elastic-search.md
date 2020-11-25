# Elastic Search

!!! Info
    This feature is only available in [GCP clusters](../clusters/gcp.md).

The NAIS platform offers Elastic Search via Aiven.

## Get your own
As there are few teams that need an Elastic Search instance we use a IaC-repo to provision each instance.
Head over to [aiven-iac](https://github.com/navikt/aiven-iac#elastic-search) to learn how to get your own instance.

### Username and password
For now we are manually distributing the username and password for each instance.
This user will be an admin user, which in turn can be used to create read/write users.

## Access from Nais-app
If you need access from an application, use the following [nais.yaml-reference](../nais-application/nais.yaml/reference.md#specelasticinstance).

## Support
We do not offer support on Elastic Search as software, but questions about Aiven and provisioning can be directed to [#pig_aiven](https://nav-it.slack.com/archives/C018L1JATBQ) on Slack.
