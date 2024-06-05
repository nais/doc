---
title: Debugging
tags: [postgres, debugging, how-to]
---

Check the events on the [Config Connector](https://cloud.google.com/config-connector/docs/overview) resources

```text
$ kubectl describe sqlinstance <myapp>
$ kubectl describe sqldatabase <mydb>
$ kubectl describe sqluser <myapp>
```

Check the logs of the Cloud SQL Proxy (if instance uses cloudsql-proxy)

```text
$ kubectl logs <pod> -c cloudsql-proxy
```
