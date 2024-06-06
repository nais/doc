---
title: Delete database client certificate
tags: [postgres, certificate, how-to]
---

If you have deleted your application and recreate it, there might be an issue that your new app will not be able to create a client certificate because the old one still exists.
Your deploy may fail with errormessages like 

`MountVolume.SetUp failed for volume "sqeletor-sql-ssl-cert" : secret "sqeletor-<podname>" not found`.

To delete the database client credentials for your application, you may navigate to SQL -> <your_instance> -> Connections -> Security in Cloud Console and delete your certificate there, or you may

```bash
$ gcloud sql ssl client-certs delete COMMON_NAME --instance=INSTANCE
```
COMMON_NAME is usually equal to INSTANCE usually equal to application name.
