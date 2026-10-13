---
tags: [postgres, how-to]
---

# Delete Postgres

Deleting a Postgres irreversibly removes the whole instance with all its branches and data.

Remove `uses.postgres` from all workloads that reference the database and deploy them. If the Postgres manifest is managed in Git, delete the manifest file so the next apply does not recreate the database.

Delete the Postgres:

```bash
nais alpha postgres delete <POSTGRES-NAME> --team <TEAM> --environment <ENVIRONMENT>
```

The CLI asks for confirmation before deleting.
