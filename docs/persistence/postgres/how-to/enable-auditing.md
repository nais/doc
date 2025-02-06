---
tags: [postgres, audit, troubleshooting, how-to]
---

# Audit logging

!!! info "Only available for postgreSQL in GCP"

    The cli used for this configuration can only detect sql instances in GCP.

This guide describes how to enable audit logging in your postgreSQL database.

The following steps need to be taken to enable the logging.

1. [Configure database flags](#configure-database-flags-for-your-sql-instance), and configure replication etc.
2. [Configure database internals](#use-the-nais-cli-to-configure-database-internals) to be the primary.

For more information on audit logging, see the [official documentation](https://cloud.google.com/sql/docs/postgres/pg-audit).

## Configure database flags for your sql instance

```text
$ cloudsql.enable_pgaudit = on
$ pgaudit = read | write | all
```

Example application spec: 

```yaml
spec:
  gcp:
    sqlInstances:
    - name: myapp
      flags:
        - name: "cloudsql.enable_pgaudit"
          value: "on"
        - name: "pgaudit.log"
          value: "write"
```

## Use the nais cli to configure database internals

The nais cli can be used to configure the database internals. This will fail if the necessary database flags have not been configured.
The cli will log on to your database and create the pgaudit extension and also disable logging for the application user.

```shell
$ nais postgres audit <application> <namespace> <context>
```

For more information on the nais cli, see the [official documentation](https://doc.nais.io/cli).
