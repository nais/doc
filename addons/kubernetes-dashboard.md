# Kubernetes Dashboard

The NAIS platform comes with the default [Kubernetes dashboard](https://github.com/kubernetes/dashboard)
running in its own namespace in each cluster. It is also running without an ingress, so you will need to use
[port-forwarding](https://kubernetes.io/docs/tasks/access-application-cluster/port-forward-access-application-cluster/)
to interact with it.

With [kubectl](https://kubernetes.io/docs/reference/kubectl/kubectl/) 1.10 and later, the following command can be run:

```bash
$ kubectl port-forward deployment/kubernetes-dashboard 9090:9090 \
  --namespace kubernetes-dashboard
```
