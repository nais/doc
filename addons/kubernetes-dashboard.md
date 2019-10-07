# Kubernetes Dashboard

The NAIS platform comes with the default [Kubernetes dashboard][1] running in its own namespace in each cluster.
It is also running without an ingress, so you will need to use [port-forwarding][2] to interact with it.

With [kubectl][3] 1.10 and later, the following command can be run:

```bash
$ kubectl port-forward deployment/kubernetes-dashboard 9090:9090 \
  --namespace kubernetes-dashboard
```


[1]: https://github.com/kubernetes/dashboard
[2]: https://kubernetes.io/docs/tasks/access-application-cluster/port-forward-access-application-cluster/
[3]: https://kubernetes.io/docs/reference/kubectl/kubectl/
