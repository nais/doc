---
title: Cloud SQL Proxy
tags: [postgres, cloudsql, cloud, sql, proxy, explanation]
---

!!! info
    For instances created before 2024-04-18

The application will connect to the database using [Cloud SQL Proxy](https://cloud.google.com/sql/docs/postgres/sql-proxy), ensuring that the database communication happens in secure tunnel, authenticated with automatically rotated credentials.

NAIS will add and configure the proxy client container as a sidecar in the pod, making it available on `localhost` for the application. The application will then connect to the proxy using standard database protocol just as if it was the actual database.

![The diagram shows how the application connects to the database using Cloud SQL Proxy. Cloud SQL connects to an instance, the proxy server communicates with the proxy client using a TCP secure tunnel. The proxy client is a sidecar in the pod,  available on the localhost for the application on the client machine.](../../../assets/sqlproxy.svg)

For more detailed information, check out the [Cloud SQL Proxy documentation](https://cloud.google.com/sql/docs/postgres/sql-proxy)
