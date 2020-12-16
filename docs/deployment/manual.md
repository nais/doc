# Manually

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

