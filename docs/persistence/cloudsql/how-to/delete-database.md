---
title: Delete a Cloud SQL instance
tags: [postgres, delete, database, how-to]
---

Delete a Cloud SQL instance without deleting your application. Deleting the application doesn't delete the instance by default.

## Enable cascading deletion

Set [cascadingDelete](../../../workloads/application/reference/spec.md#gcpsqlinstancescascadingdelete) to `true` on the instance in your application manifest:

```yaml title="app.yaml" hl_lines="5"
spec:
  gcp:
    sqlInstances:
      - type: POSTGRES_17
        cascadingDelete: true
        databases:
          - name: mydb
```

[Deploy your application](../../../build/how-to/build-and-deploy.md) with the instance still in the manifest. Wait for the deployment to succeed before removing the instance.

## Remove the instance from the manifest

Remove `sqlInstances` from `spec.gcp`. Keep any other settings under `gcp`. If none remain, remove `gcp` too, as shown below:

```diff title="app.yaml"
spec:
-  gcp:
-    sqlInstances:
-      - type: POSTGRES_17
-        cascadingDelete: true
-        databases:
-          - name: mydb
```

Deploy your application again. Nais deletes the instance after the deployment.

## Verify deletion

=== "Console"

    1. Open [Nais Console](<<tenant_url("console")>>) and select your team.
    2. Select **Cloud SQL**.
    3. Check that the instance no longer appears in the list for its environment.

=== "CLI"

    List the Cloud SQL instances for your team and environment:

    ```bash
    nais cloudsql list --team <TEAM> --environment <ENVIRONMENT>
    ```

    Check that the instance no longer appears in the output.
