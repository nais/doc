---
title: Delete database client certificate
tags: [postgres, certificate, how-to]
---

If you have deleted your application and recreate it, there might be an issue that your new app will not be able to create a client certificate because the old one still exists.
Your deploy may fail with an error message such as the one below:

```
MountVolume.SetUp failed for volume "sqeletor-sql-ssl-cert" : secret "sqeletor-<podname>" not found
```

To delete the database client credentials for your application, in Google Cloud Console navigate to [Cloud SQL instances](https://console.cloud.google.com/sql/instances) -> <your_instance> -> Connections -> Security, and then scroll down to _Manage client certificates_ and delete your certificate there.

This can also be done using the `gcloud`-cli.

```bash
$ gcloud sql ssl client-certs delete COMMON_NAME --instance=INSTANCE
```

_COMMON_NAME_ is usually equal to _INSTANCE_, which is usually equal to application name.
Run `kubectl describe sqlsslcert <certificate>` to find _COMMON_NAME_ and _INSTANCE_ for one specific certificate.
