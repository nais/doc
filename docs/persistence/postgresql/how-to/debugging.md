---
tags: [postgres, debugging, troubleshooting, how-to]
---

# Debugging

When issues arise with your [Postgres cluster](../explanations/postgres-cluster.md), you can use the following steps to troubleshoot the problem.

Some times your application may look fine and work fine, but some update to the postgres cluster has not been properly applied.
In these situations, inspecting the resources may reveal update problems.
If there is a problem with updating the postgres cluster, the problem needs to be resolved before further changes can be applied.

## Check the events and status on the relevant Kubernetes resources

```text
$ kubectl describe postgresql -n pg-<my-team> -lapp=<my-app>
$ kubectl describe sts -n pg-<my-team> -lapp=<my-app>
$ kubectl describe pod -n pg-<my-team> -lapp=<my-app>
$ kubectl describe pvc -n pg-<my-team> -lapp=<my-app>
$ kubectl describe secret -n <my-team> -lapp=<my-app>
```
