---
title: Fix database credentials issues
tags: [postgres, password, credentials, how-to]
---

## Workaround for password synchronization issues

We recommend using [nais-cli] for rotating password for your Postgres database user.

```bash
nais postgres password rotate appname
```

### Manually

Retrieve the password from the secret google-sql-`MYAPP` in your namespace (the password is base64 encoded):

```shell
kubectl get secret google-sql-<MYAPP> -o jsonpath="{ .data['<YOUR PASSWORD VARIABLE>'] }" | base64 -d
```

Log in to the Google [Cloud Console](https://console.cloud.google.com) and set the password manually for the application user in the sql instance:
SQL -> `DB_INSTANCE` -> Users -> `USERNAME` -> Change password

## Reset database credentials

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
