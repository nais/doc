# Deployment

> Performing deployments requires that you have [access to the cluster](../getting-started) and `kubectl` configured

This guide will take you through a deployment of a NAIS application

## Create a `nais.yaml`
To get your application running on NAIS, you create a [nais.yaml](https://github.com/nais/naiserator/#naisioapplication-spec) file.
This is a [custom resource](https://kubernetes.io/docs/tasks/access-kubernetes-api/custom-resources/custom-resource-definitions/) defined by the platform team, and provides the [deployment operator](https://github.com/nais/naiserator) the necessary information for setting up your application on NAIS. 

If it's your first `nais.yaml`, it might be helpful to look at [this example `nais.yaml` file](https://github.com/nais/naiserator/tree/master/examples/nais.yaml) and replace with your own information. 

## Manual deploy

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

## Automated deploy

To automate the deployment, the nais.yaml manifest and `kubectl` must be available in your CI/CD pipeline.

### Machine user config file

You will need a config file for your machine user (ask for one in #nais Slack if you don't have any).
On Jenkins you can upload the file as a credential secret file and copy it into your workspace when building:

```
withCredentials([file(credentialsId: 'CREDENTIALS_ID', variable: 'KUBECONFIG_FILE')]) {
    sh "cp $KUBECONFIG_FILE files/.kube/config" 
}
```

If you are using Travis or CircleCI, make sure that the config file is not displayed in the build log.

### Handling `nais.yaml` for multiple environments

It is common for a application to run both the `dev` and `prod` cluster. The `nais.yaml` files for these two instances will typically very similar, and it's natural to avoid duplicating too much config by using some sort of tool (templating or other). Here it's up to each team how they wish to solve this. See example [here](./examples/kustomize), where [kustomize](https://github.com/kubernetes-sigs/kustomize) is used. Kustomize is natively supported in `kubectl` from version 1.14.

With this example, one would generate and apply the configuration like this
```
$ kustomize build testapp/dev-gcp | kubectl apply -f -
```

or 

```
$ kubectl apply -k testapp/dev-gcp # kubectl version >= 1.14
```

Since your `nais.yaml` files often will contain actual endpoints and other concrete values, we consider it the best practice to have a separate private repository for your nais configuration files if your application is open source. Each team typically has a single repository containing config for the applications they are maintaining.


### Using naisd?
See migration guide [here](migrating_from_naisd.md)
Or user documentation [here](naisd.md)
