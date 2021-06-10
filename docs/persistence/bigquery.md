# Bigquery Datasets

!!! info
    This feature is only available in [GCP](../../clusters/gcp) clusters.

## NAIS Application yaml manifest options
Full documentation of all available options can be found over at: [`spec.gcp.bigQueryDatasets[]`](../../nais-application/application#gcpbigquerydatasets).

Example of an application using a `nais.yaml` provisioned BigQuery Dataset can be found here: [testapp](https://github.com/nais/testapp/blob/master/pkg/bigquery/bigquery.go).

## Minimal Working Example

=== "See below for a minimal working example for a NAIS Application manifest"
    ```yaml
    apiVersion: "nais.io/v1alpha1"
    kind: "Application"
    metadata:
      name: app-a
    ...
    spec:
      ...
      gcp:
        bigQueryDatasets:
          - name: my_bigquery_dataset
            permission: READWRITE
    ```

## Caveats to be aware of

=== "Automatic Deletion"
    Once a BigQuery Dataset is provisioned, it will not be automatically deleted - unless one explicitly sets [`spec.gcp.bigQueryDatasets[].cascadingDelete`](../../nais-application/application#gcpbigquerydatasetscascadingdelete) to `true`.
    This means that any cleanup must be done manually.  
    <br/>
    When there exist no tables in the specified BigQuery Dataset, deleting the "nais application" will delete the whole BigQuery Dataset, even if [`spec.gcp.bigQueryDatasets[].cascadingDelete`](../../nais-application/application#gcpbigquerydatasetscascadingdelete) is set to `false`.
=== "Unique names"
    The name of your Dataset must be unique within your team's GCP project.
=== "Updates/Immutability"
    The NAIS Manifest does not currently support updating any setting of existing BigQuery Datasets.  
    <br/>
    Thus, if you want a read-connection to a already-created BigQuery Dataset, take a look at [nais/dp](https://github.com/nais/dp/#dp).
=== "K8s resource naming"
    Since Kubernetes does not permit underscores (`_`) in the names of any K8s resource, any underscores will be converted to hyphens (`-`).

## Example with all configuration options

See [full example](../nais-application/example.md).

## Troubleshooting
If you have problems getting your bucket up and running, check errors in the event log:

```bash
kubectl describe bigquerydataset my-bigquery-dataset
```

