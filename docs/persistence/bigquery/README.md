---
tags: [persistence, bigquery, explanation, services]
---

# Google Cloud BigQuery Dataset

Google Cloud BigQuery is a service that provides a relational database that is optimized for analytical workloads. It is a good choice for storing data that is relational in nature.

Nais provides BigQuery for storing and working with analytical datasets as a
managed service through Google Cloud Platform. This page describes how to get
started with BigQuery for your applications.

## Nais Application yaml manifest options

Full documentation of all available options can be found over at: [`spec.gcp.bigQueryDatasets[]`](../../workloads/application/reference/application-spec.md#gcpbigquerydatasets).

Example of an application using a `nais.yaml` provisioned BigQuery Dataset can be found here: [testapp](https://github.com/nais/testapp/blob/master/pkg/bigquery/bigquery.go).

## Caveats to be aware of

=== "Automatic Deletion"
    Once a BigQuery Dataset is provisioned, it will not be automatically deleted - unless one explicitly sets [`spec.gcp.bigQueryDatasets[].cascadingDelete`](../../workloads/application/reference/application-spec.md#gcpbigquerydatasetscascadingdelete) to `true`.
    Clean up is done by deleting application resource and deleting the BigQuery instance directly in [console.cloud.google.com](https://console.cloud.google.com/bigquery).
    <br/>
    When there exist no tables in the specified BigQuery Dataset, deleting the "nais application" will delete the whole BigQuery Dataset, even if [`spec.gcp.bigQueryDatasets[].cascadingDelete`](../../workloads/application/reference/application-spec.md#gcpbigquerydatasetscascadingdelete) is set to `false`.
=== "Unique names"
    The name of your Dataset must be unique within your team's GCP project.
=== "Updates/Immutability"
    The NAIS Manifest does not currently support updating any setting of existing BigQuery Datasets.
    <br/>
    Thus, if you want a read-connection to a already-created BigQuery Dataset, take a look at [nais/dp](https://github.com/nais/dp/#dp).
=== "K8s resource naming"
    Since Kubernetes does not permit underscores (`_`) in the names of any K8s resource, any underscores will be converted to hyphens (`-`).

## Example with all configuration options

See [full example](../../workloads/application/reference/application-example.md).
