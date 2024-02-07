# Create an instance of BigQuery

Below you'll se a minimal working example for a NAIS Application manifest.

## 1. Create dataset
???+ note ".nais/app.yaml"

    ```yaml
    apiVersion: "nais.io/v1alpha1"
    kind: "Application"
    metadata:
      name: <MY-APP>
    ...
    spec:
      ...
      gcp:
        bigQueryDatasets:
          - name: <MY-DATASET>
            permission: READWRITE
    ```