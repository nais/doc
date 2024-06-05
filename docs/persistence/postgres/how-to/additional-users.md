---
title: Additional user(s) database(s)
tags: [postgres, users, how-to]
---

You can add users to your database by setting database configuration option: `.spec.gcp.sqlInstances[].databases[].users[].name`.
Additional users needs to manually be given access to the database and table.
Either directly or with Flyway or other database migration tools.

Names added must match regex: `^[_a-zA-Z][_a-zA-Z0-9]+$`. Secrets is generated and mounted for each user.

With `.spec.gcp.sqlInstances[].databases[].envVarPrefix` set to `DB` and additional username to `_user2` you will get environment variables in format `DB_USER2_MYDB_USERNAME` etc.

!!! info
    If you've deployed your application with an additional users, and then change name or remove the user from configuration, you need to _manually_ delete the `google-sql-<MYAPP>-<USER>` secret:
    ```bash
    $ kubectl delete secret google-sql-<MYAPP>-<USER>
    ```
