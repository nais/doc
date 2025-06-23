---
title: Certification sync issues
tags: [postgres, certificate, how-to, troubleshooting, debugging]
---

If you have deleted your application and recreate it, there might be an issue that your new app will not be able to create a client certificate because the old one still exists.
Your deploy may fail with an error message such as the one below:

```
MountVolume.SetUp failed for volume "sqeletor-sql-ssl-cert" : secret "sqeletor-<podname>" not found
```

This message can show up for a number of reasons (see our [troubleshooting guide](../../../workloads/how-to/troubleshooting.md)), so be sure to confirm that the certificate is the issue before proceeding.

```bash
$ kubectl describe sqlsslcert -lapp=<your_app>
```

Under `Events` you should see an error detailing the reason for the failure.
If the error mentions an already existing certificate, you can delete it.

To delete the database client certificate for your application, in Google Cloud Console navigate to [Cloud SQL instances](https://console.cloud.google.com/sql/instances) -> <your_instance> -> Connections -> Security, and then scroll down to _Manage client certificates_ and delete your certificate there.

This can also be done using the `gcloud`-cli.

```bash
$ gcloud sql ssl client-certs delete COMMON_NAME --instance=INSTANCE
```

_COMMON_NAME_ is usually equal to _INSTANCE_, which is usually equal to application name.
The output of the `kubectl describe sqlsslcert` command you did earlier will contain the relevant values for _COMMON_NAME_ and _INSTANCE_. 
