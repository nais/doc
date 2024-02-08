---
---
description: >-
  NAIS provides managed search index services through OpenSearch as a drop-in
  replacement for Elasticsearch. This page describes how to get started with
  OpenSearch for your applications.
---

Creating a OpenSearch instance is done by adding a OpenSearch resource to your namespace with detailed configuration in a GCP cluster. In your `Application` or `Naisjob` specifications, you specify an instance and access.

The minimal OpenSearch resource looks like this:

```yaml
apiVersion: aiven.io/v1alpha1
kind: OpenSearch
metadata:
  labels:
    team: myteam
  name: opensearch-myteam-myinstance
  namespace: myteam
spec:
  plan: hobbyist
  project: nav-dev
```
(TODO: NAV)
 The actual name of the OpenSearch instance will be `opensearch-<team name>-<instance name>` (where `team name` is the same as the namespace your application resides in). The resource needs to have this full name in order to be accepted.

As we use Aiven's operator, [the OpenSearch resource is documented in detail](https://aiven.github.io/aiven-operator/api-reference/opensearch.html) in the Aiven documentation. Check the reference for any other fields that might be of interest.

### ServiceIntegration

A ServiceIntegration is used to integrate the OpenSearch instance with Prometheus.
It is pretty straight forward, with little to no configuration needed.

Simple 5 steps procedure:
(TODO: gix for tenant)
1. Copy the below yaml into a file (it can be the same file as your OpenSearch instance)
2. Replace `nav-dev` with your project name (in field `project`)
   `project` should match your nais tenant (`nav`, `ssb` or `fhi`) and the environment you are running in (ex. `dev`, `prod`), with a dash (`-`) in between.
3. Replace `myteam` with your team name (in `labels`, `namespace` and `sourceServiceName`)
4. Replace `sessions` with the name of your OpenSearch instance (in `name` and `sourceServiceName`)
5. Replace `00000000-0000-0000-0000-000000000000` with the endpoint ID from the table below (in `destinationEndpointId`)
6. Deploy the resource using the same pipeline as you use for your OpenSearch instance


```yaml
---
apiVersion: aiven.io/v1alpha1
kind: ServiceIntegration
metadata:
  labels:
    team: myteam
  name: opensearch-myteam-sessions
  namespace: myteam
spec:
  project: nav-dev
  integrationType: prometheus
  destinationEndpointId: 00000000-0000-0000-0000-000000000000
  sourceServiceName: opensearch-myteam-sessions
```

#### Prometheus Endpoint IDs
(TODO: Fix for tenant)
| Environment | Endpoint ID                          |
|-------------|--------------------------------------|
| nav-dev     | f20f5b48-18f4-4e2a-8e5f-4ab3edb19733 |
| nav-prod    | 76685598-1048-4f56-b34a-9769ef747a92 |


### Previous usage

Previously, we defined the OpenSearch instances using Terraform in the [aiven-iac](https://github.com/navikt/aiven-iac) IaC-repo. As we are moving away from Terraform for self-service services on Aiven, we will not be using this method anymore.