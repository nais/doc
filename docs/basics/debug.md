# Debugging

## Debug `kubectl`

Ephemeral container is a temporary container that can be added to an existing pod to perform a specific task, such as
debugging, monitoring, or troubleshooting. Unlike regular containers, ephemeral containers do not persist beyond their
immediate use, and they are not part of the pod’s desired state. Therefore, ephemeral containers can be used for
debugging and monitoring when a pod is live in a cluster, without changing the pod spec or restarting its pod. Ephemeral
container is useful when `kubectl exec` is insufficient because a container 
has crashed or a container image doesn't include debugging utilities.

To run an ephemeral container in a pod, use the `kubectl debug` command.
The following example starts a shell in a new ephemeral container named `debugger-id` in the `my-pod-name` pod:

```bash
kubectl debug -it my-pod-name --image="cgr.dev/chainguard/busybox:latest" --profile=restricted -- sh
```

The `--profile=restricted` flag is required to run the ephemeral debug container as a non-root user and without any
capabilities. Supported images are listed in [debug images list](../deployment/allowed-registries).

## Attach `kubectl`

!!! note "kubectl attach"

    kubectl attach my-pod-name -c debugger-dx4dr -i -t

    The -i flag causes kubectl debug to attach to the container by default.
    You can prevent this by specifying --attach=false.
    If your session becomes disconnected you can reattach using `kubectl attach`

Once the ephemeral container is created, you will be presented with a shell prompt. Then run some diagnostic commands
and inspect the container’s environment, or modify the container’s configuration to debug the issue.

```text
kubectl debug -it my-pod-name --image="cgr.dev/chainguard/busybox:latest" --profile=restricted -- sh
Defaulting debug container name to debugger-lrmqq.
If you don't see a command prompt, try pressing enter.
~ $ 
```

Don't forget to clean up after yourself:

```bash
kubectl delete po my-pod-name
```

You can read more about
the `kubectl debug` [command](https://kubernetes.io/docs/tasks/debug-application-cluster/debug-running-pod/#ephemeral-container).

## Security hardened images

The support for restricted ephemeral debug containers also gives your team ability to take advantage of distroless and
other security hardened images such as [distroless](https://github.com/GoogleContainerTools/distroless) or [chainguard](https://github.com/chainguard-images/images#chainguard-images).

This is a great way to reduce the attack surface of your application and improve security.