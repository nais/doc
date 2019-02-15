# Naiserator tips

## Vault
When migrating to naiserator, you need to put your secrets in Vault, if you have any.

The secrets will be injected into your container as files.

If you base your Docker image on `navikt/java`, the secrets will be available for you as environment variables by default.

And if you name the Vault keys as they were in Fasit, your application will not need to be rewritten to use the Vault secrets.



## Docker build

Set up a build to tag with something unique but still useful, for instance date along with git commit SHA. We do not recommend using the tag `latest` in your build pipeline.


## Deploy yaml repository
Set up a repository for your teams naiserator yaml files.

```
templates/app.yaml
vars/clustername/app.yaml
```




## Pipeline

### generate yaml
```
// update image version in vars:
sh "sed -E -i 's/^image_version: \".*/image_version: \"${releaseVersion}\"/' ${tmpDirectory}/${infraRepo}/vars/preprod-fss/basta.yaml"
// generate yaml with naisplater image
sh "sudo docker run -v ${WORKSPACE}/files/INFRA_REPO:/infra-repo -v ${WORKSPACE}/files/out:/data/yaml/ navikt/naisplater:${naisplaterVersion} /bin/bash -c \"naisplater CLUSTER_NAME /infra-repo/templates /infra-repo/vars /out/yaml/\""
```

### kubectl

To deploy from your pipeline, you need the config file for you machine user available for the pipeline.
On Jenkins you can upload the file as a credential secret file and copy it into your workspace when building:

```
withCredentials([file(credentialsId: 'CREDENTIALS_ID', variable: 'KUBECONFIG_FILE')]) {
    sh "cp $KUBECONFIG_FILE files/.kube/config" 
}
```

Use `lachlanevenson/k8s-kubectl` to apply the yaml files:

```
sh "sudo docker run -v ${WORKSPACE}/files/out:/data -v ${WORKSPACE}/files/.kube/config:/root/.kube lachlanevenson/k8s-kubectl:${kubectlVersion} apply -f /data/yaml/clustername/app.yaml "

```