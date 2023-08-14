# Debugging

!!! warning "kubectl: version skew"
    This feature requires `kubectl` version [1.27](https://github.com/kubernetes/kubernetes/blob/master/CHANGELOG/CHANGELOG-1.27.md) or later.
    
    We require the flag --profile=restricted when using `kubectl debug` and the flag is only supported in `kubectl` 1.27+. 
    At this time, this is the only way to run the ephemeral containers as [non-root and without any capabilities](https://kubernetes.io/docs/tasks/configure-pod-container/security-context/).
    
    Currently, our clusters are running on 1.24+.
    `kubectl` is supported within one minor version (older or newer) of kube-apiserver. 
    This is called [version skew](https://kubernetes.io/releases/version-skew-policy/#kubectl).
    Unexpected behavior may occur if you use a version of kubectl that is not within one minor version of your cluster.

    We we recommend installing `kubectl` manually, or through tools like [asdf](https://asdf-vm.com/). 
    Other installers like `brew`, can make it troublesome to managed the version skew, as it's hard to downgrade kubectl to older versions.

## `kubectl` debug

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

The `--profile=restricted` flag is required to run the ephemeral container as a non-root user and without any
capabilities. 

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
