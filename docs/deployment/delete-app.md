# Delete app
If you want to completely remove your application from a cluster, you need to have `kubectl` installed, and [access to the cluster](https://doc.nais.io/basics/access/#setup-your-kubeconfig).

Then run the following command:

```
kubectl delete app <app-name>
```

This will remove the application/pods from the cluster, do some minor cleaning (removing your ingress), and that's all.

Other services needs to be manually removed, such as [Kafka](https://doc.nais.io/addons/kafka/#permanently-deleting-topic-and-data), and [Postgres](https://doc.nais.io/persistence/postgres/#deleting-the-database).
