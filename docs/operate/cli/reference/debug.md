# debug command

The kubectl debug command allows you to troubleshoot workloads running on the NAIS platform. This command creates a
debug pod within the same namespace as the target workload and connects it to the same network. There are two options
for debugging a workload: you can either create a container within the same pod as the workload or create a separate pod
in the same namespace as the workload, with the latter option providing
a [shared namespace](https://kubernetes.io/docs/tasks/configure-pod-container/share-process-namespace/).

## debug

Creates a debug pod in the same namespace as the target workload. This command will create a debug pod in the same
namespace as the target workload and connect it to the same network.

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
