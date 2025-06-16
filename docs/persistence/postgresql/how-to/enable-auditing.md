---
tags: [postgres, audit, troubleshooting, how-to]
---

# Enable audit logging

!!! info "Only available for postgreSQL in GCP"

    The cli used for this configuration can only detect sql instances in GCP.


This guide describes how to enable audit logging in your postgreSQL database.

The following steps need to be taken to enable the logging.

1. [Configure database flags](#configure-database-flags-for-your-sql-instance), and configure replication etc.
2. [Configure database internals](#use-the-nais-cli-to-configure-database-internals) to be the primary.

The pgaudit logs will require disk space, monitor disk usage and [enable automatic storage increase](https://doc.nais.io/workloads/application/reference/application-spec/#gcpsqlinstancesdiskautoresize) if necessary.

For more information on audit logging, see the [official documentation](https://cloud.google.com/sql/docs/postgres/pg-audit).

## Configure database flags for your sql instance

!!! info "Changing cloudsql.enable_pgaudit flag"

    Changing this flag after first-time setup will restart the postgreSQL instance.

The following database flags must be set before we can enable audit logging. 
```text
cloudsql.enable_pgaudit
pgaudit.log
```

The flags can be set in the application spec:
```yaml
spec:
  gcp:
    sqlInstances:
    - name: myapp
      flags:
        - name: "cloudsql.enable_pgaudit"
          value: "on"
        - name: "pgaudit.log"
          value: "write,ddl"
```

The `cloudsql.enable_pgaudit` flag enables the pgaudit logging in the database. The `pgaudit.log` flag specifies what to log. 
Possible values for `pgaudit.log` are as follows (and all combinations of these):

- `read` - Log select and copy commands.
- `write` - Log insert, update, delete, truncate and copy commands.
- `ddl` - Log all data definition language commands not included in `role`.
- `role` - Log role and permission changes (grant, revoke, create/alter/drop role).
- `misc` - Log miscellaneous commands (discard, fetch, checkpoint, vacuum, set).
- `misc_set` - Log miscellaneous set commands.
- `function` - Log function calls and do-blocks operations.
- `all` - Log all commands.

Other flags that are available for pgaudit are documented [here](https://github.com/pgaudit/pgaudit/blob/main/README.md#settings).

## Use the nais cli to configure database internals

The nais cli can be used to configure the database internals. This will fail if the necessary database flags have not been configured.
The cli will log on to your database and create the pgaudit extension and also disable logging for the application user.

```shell
$ nais postgres enable-audit <application> <namespace> <context>
```
The application is required, the current namespace and context will be used if these are not specified.

For more information on the nais cli, see the [official documentation](https://doc.nais.io/cli).
