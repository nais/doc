# Delete app
If you want to completely remove your application from a cluster, you need to have `kubectl` installed, and [access to the cluster](https://doc.nais.io/basics/access/#setup-your-kubeconfig).

Then run the following command:

```
kubectl delete app <app-name> -n <namespace> --context <cluster>
```

This will remove the application/pods from the cluster, do some minor cleaning (removing your ingress), and that's all.

Other services needs to be manually removed, such as:

- [Kafka](../persistence/kafka/manage_topics.md#permanently-deleting-topic-and-data)
- [Postgres](../persistence/postgres.md#deleting-the-database)

## FAQ

### I deleted an application by running `kubectl delete deployment <app-name>`, why did it reappear?

???+ faq "Answer"

    An `Application` is a resource in Kubernetes that itself is the source of configuration for other resources, e.g. `Deployment`.
    By only deleting `Deployment`, it will be recreated whenever the parent resource `Application` is synchronized again.

    To ensure that an application is completely deleted from the cluster, delete the `Application` as [shown above](#delete-app).
