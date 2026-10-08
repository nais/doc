---
tags: [persistence, postgres, explanation]
---

# Postgres

!!! warning "Preview"
    Postgres is in preview. Use it with care; the API and supported workflows may change.

Postgres gives your Applications and Jobs a managed PostgreSQL database. You can create a database yourself and connect your workloads to it.

Postgres automatically creates and manages credentials for your workloads. You can also get short-lived personal access from the Nais CLI when you need to inspect the database.

Postgres keeps backups continuously. When you need an older copy of the data, restore it to a new branch and inspect it without affecting the workloads that use your current database.

## Next steps

[:dart: Create Postgres](how-to/create.md)

[:dart: Manage Postgres](how-to/manage.md)

[:dart: Connect a workload](how-to/use-in-workload.md)

[:dart: Connect from your laptop](how-to/personal-access.md)

[:dart: Restore a branch from backup](how-to/restore-branch.md)

[:dart: Delete an inactive branch](how-to/delete-branch.md)

[:books: Postgres workload credentials](reference/workload-credentials.md)

[:books: Postgres manifest reference](reference/spec.md)
