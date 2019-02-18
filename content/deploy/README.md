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

### Manifest nais.yaml

If your team has several apps running on NAIS, you might consider creating a dedicated repository for all the manifest files.
If your team is only running one application or don't see the need for such a repository, you can keep the manifest in the same repository as the application code.

#### Dedicated manifest repository

This is a recommendation on how to organize your manifest files in a dedicated repository.

Split up the nais.yaml manifest in template and variables:

```
templates/app.yaml
vars/preprod-cluster/app.yaml
vars/prod-cluster/app.yaml
```

And in your deploy pipeline use [naisplater](https://hub.docker.com/r/navikt/naisplater) in order to merge the template and vars and generate the manifest:

```
docker run -v `pwd`/YOUR_INFRA_REPO:/infra-repo -v `pwd`/out:/data/yaml/ navikt/naisplater:${naisplaterVersion} /bin/bash -c "naisplater CLUSTER_NAME /infra-repo/templates /infra-repo/vars /data/yaml/"
```

Where `CLUSTER_NAME` must match the name of the subfolder in templates and vars. The generated nais.yaml manifest will be available on the path mounted, in the example above <code>\`pwd\`/out</code>.

Check out the [naisplater](https://github.com/nais/naisplater) documentation and implementation for more information on how to use.

### Kubectl apply

To run `kubectl` from the pipeline, we recommend using the Docker image `lachlanevenson/k8s-kubectl`:

```
docker run -v ${WORKSPACE}/files/out:/data -v ${WORKSPACE}/files/.kube/config:/root/.kube/config lachlanevenson/k8s-kubectl:${kubectlVersion} apply -f /data/yaml/clustername/app.yaml
```

### Using naisd?
See migration guide [here](migrating_from_naisd.md)
Or user documentation [here](naisd.md)
