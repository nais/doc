# Deployment

This guide will take you through the deployment of a NAIS application.
Performing deployments manually requires that you have
[access to the cluster](../getting-started)
and `kubectl` configured.

Using _naisd_ or JIRA Autodeploy? These mechanisms are deprecated and are going to be shut down.
See [migration guide from naisd to Naiserator](migrating_from_naisd.md).
All information on the current page relates to Naiserator compatible `nais.yaml` files.
You can also read the [naisd user documentation](naisd.md).

## Create a `nais.yaml`
To get your application running on NAIS, you create a [nais.yaml](https://github.com/nais/naiserator/#naisioapplication-spec) file.
This is a [custom resource](https://kubernetes.io/docs/tasks/access-kubernetes-api/custom-resources/custom-resource-definitions/) defined by the platform team,
and provides the [Naiserator deployment operator](https://github.com/nais/naiserator) with the necessary information to set up your application on NAIS. 

If it's your first `nais.yaml`, it might be helpful to look at [this example `nais.yaml` file](https://github.com/nais/naiserator/tree/master/examples/nais.yaml) and replace with your own information. 

## Manual deploy

```
$ kubectl apply -f nais.yaml
application.nais.io/<app name> created 
```

Verify that your application is running
```
$ kubectl get pod -l app=<myapp>
NAME                          READY   STATUS    RESTARTS   AGE
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

## Automated deploy using Github
This section describes how to use _NAIS deploy_ in order to deploy directly
from cloud services such as CircleCI or TravisCI. You can use NAIS deploy also
from Jenkins running in any internal zone. NAIS deploy is the canonical and
preferred way to perform deployments on the NAIS platform.

## How it works
1. As the final step in one of your CI pipelines, a [deployment request](https://developer.github.com/v3/repos/deployments/#create-a-deployment) is created using GitHub's API. This will trigger a webhook we have set up at Github.
2. NAIS deploy receives the webhook, verifies its integrity and authenticity, assumes the identity of the deploying team, and applies your _Kubernetes resources_ into the specified [environment](#environment) (a.k.a. _cluster_).
3. If you deployed any _Application_ or _Deployment_ resources, NAIS deploy will wait until these are rolled out successfully, or a timeout occurs.
4. The deployment status is continually posted back to Github and is available through their API, enabling integration with your pipeline or monitoring setup.

### Prerequisites
* Secure your repository by restricting write access to team members.
  Activating NAIS deploy for your repository will enable anyone with write
  access to your repository to deploy on behalf of your team.

* Be a maintainer of a [Github team](https://help.github.com/en/articles/about-teams).
  The team name must be the same as your Kubernetes _team label_, and additionally
  must have write access to your repository.

### Enabling deployments for your repository
Ideally, using the [GitOps](https://www.weave.works/technologies/gitops/)
methodology, you only need to register _one_ repository with deployment access
for your team. This repository contains all of your team's infrastructure as
code, including your application deployments. That said, it is also possible to
add each of your application repositories.

Visit the [registration portal](https://deployment.prod-sbs.nais.io/auth/login)
and follow the instructions to enable deployments from your repository.
In order to do this, you need to have _maintainer_ access rights to your Github
team, and _admin_ access to the repository.

### Authenticating to the Github API
There are two ways to authenticate API requests: using a Github App, or with a personal access token.

The first option is unfortunately currently only available to Github organization admins. You can still self-service by
[creating a personal access token](https://help.github.com/en/articles/creating-a-personal-access-token-for-the-command-line)
that your CI pipeline can use to trigger the deployment. The token needs only the scope `repo_deployment`.

### Performing the deployment
In your pipeline, use our internal tool [deployment-cli](https://github.com/navikt/deployment-cli)
to make deployment requests. Variables you need include _environment_, _repository_, _team_, _application version_, _Kubernetes resources_, and your Github credentials.

Example syntax:

```
deployment-cli create \
  --environment=dev-fss \
  --repository=navikt/deployment \
  --team=<TEAM> \
  --version=<VERSION> \
  --appid=1234 \
  --key=/path/to/private-key.pem \
  --resources=nais.yaml \
  --config=placeholders.json
```

If for any reason you are unable to use _deployment-cli_, please read the section on [NAIS deploy with cURL](#nais-deploy-with-curl).

### Deployment request spec

| Key | Description | Version added |
|-----|-------------|---------------|
| environment | Which environment to deploy to. | N/A |
| payload.version | This is the *payload API version*, as described below. Array of three digits, denoting major, minor, and patch level version. | 1.0.0 |
| payload.team | Github team name, used as credentials for deploying into the Kubernetes cluster. | 1.0.0 |
| payload.kubernetes.resources | List of Kubernetes resources that should be applied into the cluster. Your `nais.yaml` file goes here, in JSON format instead of YAML. | 1.0.0 |

### Environment
Please use one of the following environments. The usage of `preprod-***` is *not* supported.
  * `dev-fss`
  * `dev-sbs`
  * `prod-fss`
  * `prod-sbs`

### NAIS deploy with cURL
A deployment into the Kubernetes clusters starts with a POST request to the [GitHub Deployment API](https://developer.github.com/v3/repos/deployments/#create-a-deployment).
The request contains information about which environment to deploy to, which team to deploy as, and what resources should be applied.

Example request:
```
{
    "ref": "master",
    "description": "Automated deployment request from our pretty pipeline",
    "environment": "prod-sbs",
    "payload": {
        "version": [1, 0, 0],
        "team": "github-team-name",
        "kubernetes": {
            "resources": [
                { kind: "Application", apiVersion: "nais.io/v1alpha", metadata: {...}, spec: {...} },
                { kind: "ConfigMap", apiVersion: "v1", metadata: {...}, spec: {...} },
            ],
        }
    }
}
```

The data can be posted from standard input through curl using a command similar to:

```
curl \
    -X POST \
    -d@- \
    -H "Accept: application/vnd.github.ant-man-preview+json" \
    -u <USERNAME>:<TOKEN> \
    https://api.github.com/repos/navikt/<REPOSITORY_NAME>/deployments
```

The version in the payload should be set to `[1, 0, 0]`.

This version field have nothing to do with your application version. It is used internally by the deployment orchestrator to
keep things stable and roll out new features gracefully.

Changes will be rolled out using [semantic versioning](https://semver.org).


## Legacy automated deploy

To automate the deployment, the `nais.yaml` manifest and `kubectl` must be available in your CI/CD pipeline.

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

It is common for applications to run multiple instances in the `dev` and `prod` clusters. 
The `nais.yaml` and other configuration files used to create these instances will typically be very similar, but will have differences in environment variables, resource requirements and ingresses.

To avoid duplicating configuration and ease the maintenance of it, it's natural to apply some sort of tooling (templating or other). See example [here](./examples/kustomize), using [kustomize](https://github.com/kubernetes-sigs/kustomize). Kustomize is natively supported in `kubectl` from version 1.14.

With this example, one would generate and apply the configuration like this
```
$ kustomize build testapp/dev-gcp | kubectl apply -f -
```

or 

```
$ kubectl apply -k testapp/dev-gcp # kubectl version >= 1.14
```

Since your `nais.yaml` files often will contain actual endpoints and other concrete values, we consider it the best practice to have a separate private repository for your nais configuration files if your application is open source. Each team typically has a single repository containing config for the applications they are maintaining.
