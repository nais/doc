---
title: Connect to a cloned database
tags: [postgres, connection, cloned, how-to]
---

If you have for some reason cloned a database in the console, you need to do some manually changes on the new database to be allowed to connect to it with your.

1. Log in to the database with the old username and password
2. Run `GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO "cloned-user";`, to give the new cloned user access to all the old tables.
   If you have objects outside of tables those also needs to be changed.
3. Delete the `google-sql-appname`-secret from the cluster (if it exists).
   This allow Naiserator to generate new secrets for the cloned database.
4. Update your `nais.yaml`-file to use the instance name of the cloned database instead of the old ones.
5. Delete the old database when you are finished.
