---
tags: [workloads, how-to, debugging, kubectl, debug, attach, oom, memory, leaks]
---

# Debugging workloads

A useful place to start when you have problems getting your pods running is the [troubleshooting guide](troubleshooting.md).

It can also be useful to check out the official documentation from Kubernetes.
Keep in mind that in the kubernetes documentation, the term "application" is a more general concept that a Nais application.

- [Troubleshoot Applications](https://kubernetes.io/docs/tasks/debug-application-cluster/debug-application/)
- [Debug Running Pods](https://kubernetes.io/docs/tasks/debug-application-cluster/debug-running-pod/)


## `kubectl` debug

You can run an [ephemeral container](https://kubernetes.io/docs/concepts/workloads/pods/ephemeral-containers/) in a pod using the `kubectl debug` command.

The following example starts a shell in a new ephemeral container in the `my-pod-name` pod using the nais debug image:

```bash
kubectl debug -it my-pod-name --image="europe-north1-docker.pkg.dev/nais-io/nais/images/debug:latest" --profile=restricted
```

Once the ephemeral container is created, you will be presented with a shell prompt where you can try debugging the issue.

!!! info "image capabilities"

    The specified `--image` cant have more capabilities than the pod it is attached to and must be able to run as non-root.

## `kubectl` attach

If you want to attach to a running process inside a running container you need to use `kubectl attach`.
You can read more about the command over at [kubernetes.io/docs](https://kubernetes.io/docs/reference/kubectl/generated/kubectl_attach/).

```bash
# Switch to raw terminal mode; sends stdin to 'bash' in ruby-container from pod mypod
# and sends stdout/stderr from 'bash' back to the client
kubectl attach mypod -c ruby-container -i -t
```

## Debugging Memory Leaks

If you experience memory leaks in Java processes you can get heap dumps either automatically on OOM or on-demand.

### Automatically on OOM

Set `JAVA_OPTS` to `-XX:+HeapDumpOnOutOfMemoryError -XX:HeapDumpPath=/tmp`

The `/tmp` volume is maintained through restarts, so if your app is restarting because of OOM, the heap dumps can be retrieved from there.

### Manually on-demand

You can use `jmap` to create a heap dump of a running Java process.

Find a pod and exec `jmap` in it (assuming PID 1 is the Java process):
```
kubectl get pods -l app=[app-name]
kubectl exec [pod-name] -- jmap -dump:all,file=/tmp/heap.hprof 1
```

### Getting the heap dump

You can use `kubectl cp` to get the files from the pod to your local computer:

```
kubectl cp [pod-name]:/tmp/heap.hprof ./heap.hprof
```

You can inspect the heap dumps with tools like JProfiler, VisualVM or IntelliJ.

## FAQ

### I get an HTTP 503 Service Unavailable error when visiting the ingress for my application, why?

???+ faq "Answer"

    This indicates that your application is not ready to serve traffic. This is usually due to one of the following:

    - The application is not deployed to the cluster
    - The application is not up and running. This can be caused by a problem with the application itself, for example:
        - The application doesn't respond to any configured [health checks](../explanations/good-practices.md#implements-readiness-and-liveness-endpoints)
        - The application only has a [single pod or replica](../application/reference/application-spec.md#replicas), and that pod is not running
        - The application is configured incorrectly (e.g. has missing required dependencies, has the wrong image, etc.)

### My application gets an HTTP 504 Gateway Timeout error when attempting to communicate with another application, why?

???+ faq "Answer"

    If you're using [service discovery](../application/explanations/expose.md#service-discovery), ensure that the [access policies](../reference/access-policies.md) for both applications are correctly set up.

    Otherwise, ensure that the other application is running and responding to requests in a timely manner (see also [ingress customization](../reference/environments.md) for timeout configuration).
