# Manual deployment

Performing deployments manually requires that you have [access to the cluster](../basics/access.md) and `kubectl` configured.

For automated deployments, use [NAIS deploy](README.md).

```text
$ kubectl apply -f nais.yaml
application.nais.io/<app name> created
```

Verify that your application is running

```text
$ kubectl get pod -l app=<myapp>
NAME                          READY   STATUS    RESTARTS   AGE
<app name>-59cbd7c89c-8h6wp   1/1     Running   0          4s
<app name>-59cbd7c89c-xpshz   1/1     Running   0          5s
```

You can also check that the `Application` resource was successfully created

```text
$ kubectl describe app <my app>
...
Events:
  Type    Reason       Age        From        Message
  ----    ------       ----       ----        -------
  Normal  synchronize  3s         naiserator  successfully synchronized application resources (hash = 13485216922060251669)
```

## Rolling back your deployment

If your newly deployed application does not work, and you wish to quickly rollback to a previous version, you can do this manually by executing the following command:

```shell
kubectl rollout undo deployment.v1.apps/<your application>
```

Note that if your `Deployment` is overridden by the `Application` resource, so if this is [resynced](#resync-your-application) / redeployed, the version and settings specified there will be effectuated.

[A more detailed description on how to roll back your deployment](https://kubernetes.io/docs/concepts/workloads/controllers/deployment/#rolling-back-a-deployment) is provided by Kubernetes.

## Resync your application

If you want to let [naiserator](https://github.com/nais/naiserator) recreate all the resources spawned by your `Application`, you can do so without deleting and redeploying it.

You can either run `kubectl edit application <your app>` and delete the `.status.synchronizationHash` field or run the following command:

```shell
kubectl patch application <your app> -p '[{"op": "remove", "path": "/status/synchronizationHash"}]' --type=json
```

Verify that your application has been resynced:
```
$ kubectl describe app <your app>
...
  Synchronization Time:       1631876997595876945
Events:
  Type    Reason        Age   From        Message
  ----    ------        ----  ----        -------
  Normal  Synchronized  69s   naiserator  Successfully synchronized all application resources
```
