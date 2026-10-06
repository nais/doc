---
tags: [postgres, how-to]
---

# Delete an inactive Postgres branch

Deleting a branch removes its database. Do not rely on backups to undo deletion. Check that the data is no longer needed and that the branch is not in use:

```bash
nais alpha postgres branch list <POSTGRES-NAME> --team <TEAM> --environment <ENVIRONMENT>
```

Delete the branch:

```bash
nais alpha postgres branch delete <POSTGRES-NAME> <BRANCH> --team <TEAM> --environment <ENVIRONMENT>
```

The CLI asks for confirmation and refuses to delete the active branch. If the branch was recently active, verify that your workloads are using the intended branch before deleting it.
