# Advanced usage

## NAIS deploy with cURL

A deployment into the Kubernetes clusters starts with a POST request to the [GitHub Deployment API](https://developer.github.com/v3/repos/deployments/#create-a-deployment). The request contains information about which cluster to deploy to, which team to deploy as, and what resources should be applied.

Example request:

```text
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
            ]
        }
    }
}
```

The data can be posted from standard input through curl using a command similar to:

```text
curl \
    -X POST \
    -d@- \
    -H "Accept: application/vnd.github.ant-man-preview+json" \
    -u <USERNAME>:<TOKEN> \
    https://api.github.com/repos/navikt/<REPOSITORY_NAME>/deployments
```

The `version` in the payload should be set to `[1, 0, 0]`. This version field have nothing to do with your application version. It is used internally by the deployment orchestrator to keep things stable and roll out new features gracefully. Changes will be rolled out using [semantic versioning](https://semver.org).

#### Deployment request spec

| Key | Description | Version added |
| :--- | :--- | :--- |
| environment | Which environment to deploy to. | N/A |
| payload.version | This is the _payload API version_, as described below. Array of three digits, denoting major, minor, and patch level version. | 1.0.0 |
| payload.team | Github team name, used as credentials for deploying into the Kubernetes cluster. | 1.0.0 |
| payload.kubernetes.resources | List of Kubernetes resources that should be applied into the cluster. Your `nais.yaml` file goes here, in JSON format instead of YAML. | 1.0.0 |


## Manual deploy with Kubectl

Performing deployments manually requires that you have [access to the cluster](../basics/access.md) and `kubectl` configured.

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

## Change team on already deployed application without downtime
To change which team owns an application you must use `kubectl` and change the team label for the application.
Deploying with the new team will not work if there exists an Application with the old team label set.

The easiest way to do this is:

  0. The user performing these actions must be a member of both the old and new team
  1. `kubectl edit application <name>`
  2. edit `.metadata.labels.team` to the name of the new team
  3. save and close
