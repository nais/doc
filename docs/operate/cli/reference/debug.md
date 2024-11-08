# debug command

The debug command allows you to troubleshoot workloads running on the NAIS platform.This command creates a
debug pod within the same namespace as the target workload and connects it to the same network. There are two options
for debugging a workload: you can either create a container within the same pod as the workload or create a separate pod
in the same namespace as the workload, with the latter option providing
a [shared namespace](https://kubernetes.io/docs/tasks/configure-pod-container/share-process-namespace/).

## debug

Creates a debug pod in the same namespace as the target workload. This command will create a debug pod in the same
namespace as the target workload and connect it to the same network.

`nais debug app` creates a debug container in the "live" pod, meaning it’s not a copy of the original pod. If you exit
this command with `exit`, you cannot reconnect or attach again, because the debug container is terminated. To
reconnect, simply run `nais debug app` again, this will create a new debug container in the same pod. See
`naist debug tidy` to clean up the pod you just debugged.

`nais debug app --copy app` creates a copy of the original pod in the same namespace. This is useful if you want to
debug the pod without affecting the live pod, useful for debugging production workloads.
If you exit this command with `exit`, you can reconnect or attach again by
running `nais debug app --copy app` again. See `nais debug tidy` to clean up the pod you just debugged.

```bash
nais debug app
```

| Argument | Required | Description                    |
|----------|----------|--------------------------------|
| app      | Yes      | Name of the workload to debug. |

| Flag      | Required | Short | Default             | Description                                               |
|-----------|----------|-------|---------------------|-----------------------------------------------------------|
| namespace | No       | -n    | current             | Namespace of the workload.                                |
| context   | No       | -c    | current             | Context of the workload.                                  |
| copy      | No       | -cp   | in current live pod | Copy the workload's pod to a separate pod with container. |
| by-pod    | No       | -p    | first pod           | Specify the pod to debug.                                 |

## tidy

Delete the debug pod. This command will delete the debug pod created by the `nais debug` command.

```bash
nais debug tidy
```

| Argument | Required | Description                     |
|----------|----------|---------------------------------|
| app      | Yes      | Name of the workload to delete. |

| Flag      | Required | Short | Default  | Description            |
|-----------|----------|-------|----------|------------------------|
| namespace | No       | -n    | current  | Namespace of the pod.  |
| context   | No       | -c    | current  | Context of the pod.    |
| copy      | No       | -cp   | live pod | Delete the copied pod. |

# debug image and tools

The image used for debugging is documented in [debug](https://github.com/nais/debug/blob/main/flake.nix) repository.