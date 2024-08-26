---
tags: [how-to, opensearch]
description: >-
  NAIS provides managed search index services through OpenSearch as a drop-in
  replacement for Elasticsearch.
---

# Create an OpenSearch instance

Explicitly creating an OpenSearch instance is done by adding a OpenSearch resource to your namespace with detailed configuration in a GCP cluster. In your `Application` or `Naisjob` specifications, you specify an instance and access.

The minimal OpenSearch resource looks like this:

???+ note "opensearch.yaml"
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

The actual name of the OpenSearch instance will be `opensearch-<TEAM NAME>-<INSTANCE NAME>` (where `TEAM NAME` is the same as the namespace your application resides in). The resource needs to have this full name in order to be accepted.

As we use Aivens operator, [the OpenSearch resource is documented in detail](https://aiven.github.io/aiven-operator/api-reference/opensearch.html) in the Aiven documentation. Check the reference for any other fields that might be of interest.


{% if tenant() in ("nav", "dev-nais") %}

### ServiceIntegration

A ServiceIntegration is used to integrate the OpenSearch instance with Prometheus.
It is pretty straight forward, with little to no configuration needed.

Simple 5 steps procedure:

1. Copy the below yaml into a file (it can be the same file as your OpenSearch instance)
2. Replace `<ENV>` with the environment you are running in (ex. `dev`, `prod`) (in field `project`)
3. Replace `<MYTEAM>` with your team name (in `labels`, `namespace` and `sourceServiceName`)
4. Replace `<INSTANCE>` with the name of your OpenSearch instance (in `name` and `sourceServiceName`)
5. Replace `<ENDPONT-ID>` with the endpoint ID from the table below (in `destinationEndpointId`)
6. Deploy the resource using the same pipeline as you use for your OpenSearch instance


???+ note "opensearch.yaml"
    ```yaml
    ---
    apiVersion: aiven.io/v1alpha1
    kind: ServiceIntegration
    metadata:
      labels:
        team: <MYTEAM>
      name: opensearch-<MYTEAM>-<INSTANCE>
      namespace: <MYTEAM>
    spec:
      project: <<tenant()>>-<ENV>
      integrationType: prometheus
      destinationEndpointId: <ENDPONT-ID>
      sourceServiceName: opensearch-<MYTEAM>-<INSTANCE>
    ```

#### Prometheus Endpoint IDs

{% if tenant() == "nav" %}

| Environment | Endpoint ID                          |
|-------------|--------------------------------------|
| nav-dev     | f20f5b48-18f4-4e2a-8e5f-4ab3edb19733 |
| nav-prod    | 76685598-1048-4f56-b34a-9769ef747a92 |

{% elif tenant() == "dev-nais" %}

| Environment  | Endpoint ID                          |
|--------------|--------------------------------------|
| dev-nais-dev | cc2fd0ad-9e62-492e-b836-86aa9654fd9b |

{% endif %}
{% endif %}
