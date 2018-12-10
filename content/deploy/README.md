# Deployment

> Performing deployments requires that you have [access to the cluster](../security/operational_access.md)

The easiest way to get your application running on NAIS is to create a [nais.yaml](https://github.com/nais/naiserator/blob/master/examples/app.yaml).  
This is a [custom resource](https://kubernetes.io/docs/tasks/access-kubernetes-api/custom-resources/custom-resource-definitions/) defined by the platform team, and contains the necessary information for setting up your application on NAIS. Read more about the technical details [here](https://github.com/nais/naiserator).
 
```
$ kubectl apply -f nais.yaml
application.nais.io/<app name> created 
```

Verify that your application is running
```
$ kubectl get po -l app=<myapp>
NAME                       READY   STATUS    RESTARTS   AGE
<myapp>-59cbd7c89c-8h6wp   1/1     Running   0          4s
<myapp>-59cbd7c89c-xpshz   1/1     Running   0          5s
```

## Environment variables

## Secrets

## Files


### [Migrating from naisd](migrating_from_naisd.md)

### Still using naisd?

See doc [here](naisd.md)


TODO: find a simpler example of app.yaml
