---
tags: [postgres, debugging, troubleshooting, how-to]
---

# Debugging

When issues arise with your [Cloud SQL instance](../explanations/cloud-sql-instance.md), you can use the following steps to troubleshoot the problem.

Some times your application may look fine and work fine, but some update to the SQLInstance has not been properly applied.
In these situations, inspecting the resources may reveal update problems.
If there is a problem with updating the SQLInstance, no changes will be applied until the problem is resolved.

## Check the events and status on the [Config Connector](https://cloud.google.com/config-connector/docs/overview) resources

```text
$ kubectl describe sqlinstance -lapp=<myapp>
$ kubectl describe sqldatabase -lapp=<myapp>
$ kubectl describe sqluser -lapp=<myapp>
$ kubectl describe sqlsslcert -lapp=<myapp>
```

## Check the logs of the Cloud SQL Proxy (if instance uses cloudsql-proxy)

```text
$ kubectl logs <pod> -c cloudsql-proxy
```
