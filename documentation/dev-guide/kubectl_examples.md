Kubectl examples
================

This document cover simple Kubectl operations, and how to solve some problems that you may experience.

Head over to [getting started](/documentation/dev-guide/README.md) if you need help setting up Kubectl.

Kubectl runs operations on specific `resources` (just like an REST-api endpoint). So a lot of these commandoes works with different types of resources. To avoid redundant examples we have tried to make the operation-examples open, and the output-examples specific for one resource.


### List resource

Typical resources to list are: pods, deployment, ingress, services

```operation
kubectl get <resource>
```

```output
$ kubectl get pods
NAME                                                           READY     STATUS             RESTARTS   AGE
dagpenger-soknadvelger-86576554bb-tlswh                        1/1       Running            0          40d
dagpenger-soknadvelger-86576554bb-xhqng                        1/1       Running            0          40d
eessi-fagmodul-frontend-6d98fc4c8c-npvt9                       1/1       Running            0          48d
engangsstonad-68d85b988b-ln9zz                                 1/1       Running            0          6d
engangsstonad-68d85b988b-v9r4v                                 1/1       Running            0          6d
```


#### List resources with labels

There are different types of labels on each pod (and other resources). The main labels to search for are `app`, and `team`.

```opertaion
kubectl get <resource> --selector app=<appname>
```

```output
$ kubectl get pods --selector app=dagpenger-soknadvelger
NAME                                      READY     STATUS    RESTARTS   AGE
dagpenger-soknadvelger-86576554bb-tlswh   1/1       Running   0          40d
dagpenger-soknadvelger-86576554bb-xhqng   1/1       Running   0          40d
```

`--selector` can be shortened to `-l`.


### Check a pods logs

```operation
kubectl logs <pod-name>
```

The pods dosen't share logs, so we recommend looking at logs at [logs.adeo.no](https://logs.adeo.no/).


### See description/configuration of a resource

```operation
kubectl describe <resource> <resource-name>
```

```output
$ kubectl describe deployment dagpenger-soknadvelger
Name:                   dagpenger-soknadvelger
Namespace:              default
CreationTimestamp:      Mon, 04 Jun 2018 22:40:19 +0200
Labels:                 app=dagpenger-soknadvelger
						team=dagpenger
# and a lot more...
```


### Deleting a resource

Some resource get recreated when deleted, if you want to remove an app, use the [/delete](/documentation/dev-guide/naisd.md#delete-endpoint) endpoint instead.

```operation
kubectl delete resource <resource-name>
```

```output
$ delete pod nais-testapp-9747b9695-tc57h
pod "nais-testapp-9747b9695-tc57h" deleted
```


### Undo a deployment (aka rollback)

```opertaion
kubectl rollout undo deployment <deployment-name>`
```

```output
$ kubectl rollout undo deployment nais-testapp
deployment.apps "nais-testapp"
$ kubectl describe deployment nais-testapp
Name:                   nais-testapp
Namespace:              default
CreationTimestamp:      Fri, 13 Jul 2018 15:40:57 +0200
# more text between
Events:
  Type    Reason              Age                     From                   Message
  ----    ------              ----                    ----                   -------
  Normal  ScalingReplicaSet   <invalid> (x2 over 9d)  deployment-controller  Scaled up replica set nais-testapp-66b86cd59c to 1
  Normal  DeploymentRollback  <invalid>               deployment-controller  Rolled back deployment "nais-testapp" to revision 1
```


## Namespaces

By default, your application will exist in its own namespace. Therefore you must specify this namespace for your kubectl operations.


### Namespace flag

You can use the namespace flag on all kubectl operations:

```operation
kubectl get pods --namespace <namespace>
```

You can also use `-n`. This command will describe the deployment `nais-testapp` in the namespace `t1`:

```operation
kubectl describe deployment nais-testapp -n t1
```

### List namespaces

To list all namespaces in the cluster:

```operation
kubectl get namespaces
```

### Switch namespace

If you haven't specified anything, kubectl will operate in the namespace `default`.

You can tell kubectl to use another namespace if you don't want to append the namespace flag to all operations every time:

```operation
kubectl config set-context $(kubectl config current-context) --namespace=<insert-namespace-name-here>
```

Validate that the namespace is set:

```operation
kubectl config view | grep namespace: -B 1
```

If you have more than one cluster (e.g. preprod and prod), this will output both clusters:

```output
$ kubectl config view | grep namespace: -B 1
	cluster: prod-sbs
	namespace: nais-testapp
--
	cluster: preprod-sbs
	namespace: t1
```

You can now run kubectl operations without specifiying namespace.
