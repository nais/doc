Kubernetes dashboard
====================

The NAIS platform comes with the default [Kubernetes dashboard](https://github.com/kubernetes/dashboard) running in it's own namespace in each cluster. It's also running without an ingress, so you need to use [port-forward](https://kubernetes.io/docs/tasks/access-application-cluster/port-forward-access-application-cluster/) to interact with it.

In [Kubectl](https://kubernetes.io/docs/reference/kubectl/kubectl/) 1.10 and later you can run the following command:

```
kubectl port-forward deployment/kubernetes-dashboard 9090:9090 --namespace kubernetes-dashboard
```

Check out [this guide](/documentation/dev-guide/README.md#install-kubectl) to install and configure `kubectl`.
