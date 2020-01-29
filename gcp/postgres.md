# Postgres

{% hint style="danger" %}
feature still under development
{% endhint %}

You can provision and configure postgres through [nais.yaml](../nais-application/manifest).

Below is the minimal configuration needed:

``` yaml
...
kind: "Application"
metadata:
  name: myapp
spec:
  ...
  gcp:
    sqlInstances:
      - type: POSTGRES_11
        databases:
          - name: mydb
```

See all configuration options in the [nais.yaml reference](../nais-application/manifest#spec-gcp-sqlinstances).

To connect your application to the database, use this info:

| key               | value                                                                                                           |
|-------------------|-----------------------------------------------------------------------------------------------------------------|
| hostname          | localhost                                                                                                       |
| port              | 5432                                                                                                            |
| database name     | `spec.gcp.sqlInstances[].databases[].name` (nais.yaml, would resolve to `mydb` in example above)                |
| database user     | `metadata.name` (nais.yaml, would resolve to `myapp` in example above)                                          |
| database password | `GCP_SQLINSTANCE_<metadata.name>_PASSWORD` (environment variable, resolves to `GCP_SQLINSTANCE_MYAPP_PASSWORD`) |

## How it works

When you deploy your application with database config, NAIS will ensure the database exists [Google Cloud SQL instance](https://cloud.google.com/sql) with the specified [Postgres](https://cloud.google.com/sql/docs/postgres/) version, and configure the application with means to connect to it.

### Cloud SQL Proxy

The application will connect to the database using [Cloud SQL Proxy](https://cloud.google.com/sql/docs/postgres/sql-proxy), ensuring that the database communication happens in secure tunnel, authenticated with automatically rotated credentials.

NAIS will add and configure the proxy client container as a sidecar in the pod, making it available on `localhost` for the application. The application will then connect to the proxy using standard database protocol, as depicted below: 

![sqlproxy](_media/sqlproxy.svg)

For more detailed information, check out the [Cloud SQL Proxy documentation](https://cloud.google.com/sql/docs/postgres/sql-proxy)




