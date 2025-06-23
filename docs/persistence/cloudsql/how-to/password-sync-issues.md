---
title: Workaround for password synchronization issues
tags: [postgres, password, credentials, how-to]
---

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

[nais-cli]: ../../../operate/cli/how-to/install.md
