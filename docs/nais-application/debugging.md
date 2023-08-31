If you have problems getting your pods running you should check out the official documentation from Kubernetes:

- [Troubleshoot Applications](https://kubernetes.io/docs/tasks/debug-application-cluster/debug-application/)
- [Debug Running Pods](https://kubernetes.io/docs/tasks/debug-application-cluster/debug-running-pod/)


PS: Applications in the context above is not the NAIS applications.
Debugging a NAIS applications resource is done with `kubectl describe application $app_name`.

# Debugging Memory Leaks

If you experience memory leaks in Java processes you can get heap dumps either automatically on OOM or on-demand.

## Automatically on OOM

Set `JAVA_OPTS` to `-XX:+HeapDumpOnOutOfMemoryError -XX:HeapDumpPath=/tmp`

The `/tmp` volume is maintained through restarts, so if your app is restarting because of OOM, the heap dumps can be retrieved from there.

## Manually on-demand

You can use `jmap` to create a heap dump of a running Java process.

Find a pod and exec `jmap` in it (assuming PID 1 is the Java process):
```
kubectl get pods -l app=[app-name]
kubectl exec [pod-name] -- jmap -dump:all,file=/tmp/heap.hprof 1
```

## Getting the heap dump

You can use `kubectl cp` to get the files from the pod to your local computer:

```
kubectl cp [pod-name]:/tmp/heap.hprof ./heap.hprof
```

You can inspect the heap dumps with tools like JProfiler, VisualVM or IntelliJ.

## `kubectl` debug

!!! info "kubectl: version"
    
    This feature requires `kubectl` version [1.28](https://github.com/kubernetes/kubernetes/blob/master/CHANGELOG/CHANGELOG-1.28.md) or later.

    Nais requires the flag --profile=restricted when using `kubectl debug` and the flag is only supported in `kubectl` 1.28+. 
    At this time, this is the only way to run the ephemeral containers as [non-root and without any capabilities](https://kubernetes.io/docs/tasks/configure-pod-container/security-context/).

Ephemeral container is a temporary container that can be added to an existing pod to perform a specific task, such as
debugging, monitoring, or troubleshooting. Unlike regular containers, ephemeral containers do not persist beyond their
immediate use, and they are not part of the pod’s desired state. Therefore, ephemeral containers can be used for
debugging and monitoring when a pod is live in a cluster, without changing the pod spec or restarting its pod. Ephemeral
container is useful when `kubectl exec` is insufficient because a container
has crashed or a container image doesn't include debugging utilities.

To run an ephemeral container in a pod, use the `kubectl debug` command.
The following example starts a shell in a new ephemeral container named `debugger-id` in the `my-pod-name` pod:

```bash
kubectl debug -it my-pod-name --image="busybox:latest" --profile=restricted -- sh
```

Once the ephemeral container is created, you will be presented with a shell prompt. Then run some diagnostic commands
and inspect the container’s environment, or modify the container’s configuration to debug the issue.

```text
kubectl debug -it my-pod-name --image="busybox:latest" --profile=restricted -- sh
Defaulting debug container name to debugger-lrmqq.
If you don't see a command prompt, try pressing enter.
~ $ 
```

## Attach `kubectl`

!!! note "kubectl attach"

    kubectl attach my-pod-name -c debugger-dx4dr -i -t

    The -i flag causes kubectl debug to attach to the container by default.
    You can prevent this by specifying --attach=false.
    If your session becomes disconnected you can reattach using `kubectl attach`

Don't forget to clean up after yourself:

```bash
kubectl delete po my-pod-name
```

You can read more about
the `kubectl debug` [command](https://kubernetes.io/docs/tasks/debug-application-cluster/debug-running-pod/#ephemeral-container).

## Exec Logs and Describe `kubectl`

With ephemeral containers, you can temporarily add another container to a running pod without having to create a new pod.
`kubectl debug` can be used as an additional [debug tool](https://kubernetes.io/docs/tasks/debug/debug-application/debug-running-pod/)
for running pods alongside `kubectl describe` and to some extent `kubectl logs` and `kubectl exec`
Unlike `exec` and `logs`, `debug` can also be used when your pod is in crashLoopBackOff or for some other reason dont start.

## Security hardened images

The support for restricted ephemeral debug containers also gives your team ability to take advantage of distroless and
other security hardened images such as [distroless](https://github.com/GoogleContainerTools/distroless).

This is a great way to reduce the attack surface of your application and improve security.

## FAQ

### I get an HTTP 503 Service Unavailable error when visiting the ingress for my application, why?

???+ faq "Answer"

    This indicates that your application is not ready to serve traffic. This is usually due to one of the following:
    
    - The application is not deployed to the cluster
    - The application is not up and running. This can be caused by a problem with the application itself, for example:
        - The application doesn't respond to any configured [health checks](../nais-application/good-practices.md#implements-readiness-and-liveness-endpoints)
        - The application only has a [single pod or replica](../nais-application/application.md#replicas), and that pod is not running
        - The application is configured incorrectly (e.g. has missing required dependencies, has the wrong image, etc.)
        - The application attempts to write files to the filesystem, which is mostly [read-only by default](../nais-application/securitycontext.md#disable-read-only-file-system)

    See also [troubleshooting for deployments](../deployment/troubleshooting.md).

### My application gets an HTTP 504 Gateway Timeout error when attempting to communicate with another application, why?

???+ faq "Answer"

    If you're using [service discovery](../clusters/service-discovery.md), ensure that the [access policies](access-policy.md) for both applications are correctly set up.
    
    Otherwise, ensure that the other application is running and responding to requests in a timely manner (see also [ingress customization](ingress.md) for timeout configuration).

