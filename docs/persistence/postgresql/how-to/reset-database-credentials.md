---
title: Reset database credentials
tags: [postgres, password, credentials, how-to]
---

!!! info
    If you have multiple sql users their names will be on the format: `<MYAPP>-<MYDB>-<SQLUSERNAME>` instead of `<MYAPP>`

To reset the database credentials for your application (if application name, database name or envVarPrefix has been changed), you need to first delete the secret and sqluser for the database:

```bash
$ kubectl delete secret google-sql-<MYAPP>
$ kubectl delete sqluser <MYAPP>
```

Then either redeploy your application or force a synchronization of your application:

```bash
kubectl patch application <MYAPP> -p '[{"op": "remove", "path": "/status/synchronizationHash"}]' --type=json
```
