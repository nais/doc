---
title: Failing to assign private IP to an existing Cloud SQL instance
tags: [postgres, private-ip, how-to, troubleshooting, debugging]
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
If you see a message that says `Cannot assign a private IP address for an existing Cloud SQL instance in a Shared VPC`, 
the problem is that the deletion of the application resulted in a bit of information being lost, which causes nais to attempt to assign a private IP to the instance.

An [SQLInstance](../../persistence/postgres/explanations/cloud-sql-instance.md) created before 2024-04-18 will have a public IP address, and can not be updated to have a private IP address.
This error occurs when the SQLInstance resource in the cluster has been deleted, without the corresponding instance actually being deleted in GCP.
In this case, nais is unable to detect that the instance has a public IP, and will attempt to assign a private IP, which is not possible.

The solution is to edit the SQLInstance resource in the cluster and removing the `ipConfiguration` stanzas:
`kubectl patch sqlinstance <instance name> -n <namespace> --type json -p='[{"op": "remove", "path": "/spec/settings/ipConfiguration/privateNetworkRef"}]'`.
After a few minutes the issue will be resolved and the secrets will be created.
