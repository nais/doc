---
tags: [how-to, bigquery]
---

# Create an instance of BigQuery

Below is a minimal working example for a Nais Application manifest.

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