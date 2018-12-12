# Deployment

> Performing deployments requires that you have [access to the cluster](../getting-started)

This guide will take you through a deployment of a NAIS application

## Create a `nais.yaml`
To get your application running on NAIS, you create a [nais.yaml](https://github.com/nais/naiserator/#naisioapplication-spec) file.
This is a [custom resource](https://kubernetes.io/docs/tasks/access-kubernetes-api/custom-resources/custom-resource-definitions/) defined by the platform team, and provides the [deployment operator](https://github.com/nais/naiserator) the necessary information for setting up your application on NAIS. 

If it's your first `nais.yaml`, it might be helpful to look at [this example `nais.yaml` file](https://github.com/nais/naiserator/tree/master/examples/nais.yaml) and replace with your own information. 

## Deploy using `kubectl`

```
$ kubectl apply -f nais.yaml
application.nais.io/<app name> created 
```

Verify that your application is running
```
$ kubectl get pod -l app=<myapp>
NAME                       READY   STATUS    RESTARTS   AGE
<app name>-59cbd7c89c-8h6wp   1/1     Running   0          4s
<app name>-59cbd7c89c-xpshz   1/1     Running   0          5s
```

You can also check that the `Application` resource was successfully created
```
$ kubectl describe app <my app>
...
Events:
  Type    Reason       Age        From        Message
  ----    ------       ----       ----        -------
  Normal  synchronize  3s         naiserator  successfully synchronized application resources (hash = 13485216922060251669)
```


### Using naisd?
See migration guide [here](migrating_from_naisd.md)
Or user documentation [here](naisd.md)
