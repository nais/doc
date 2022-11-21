If you have problems getting your pods running you should check out the official documentation from Kubernetes:

- [Troubleshoot Applications](https://kubernetes.io/docs/tasks/debug-application-cluster/debug-application/)
- [Debug Running Pods](https://kubernetes.io/docs/tasks/debug-application-cluster/debug-running-pod/)

PS: Applications in the context above is not the NAIS applications.
Debugging a NAIS applications resource is done with `kubectl describe application $app_name`.

# Debugging Memory Leaks

If you experience memory leaks you can get heap dumps either automatically on OOM or on-demand.

## Automatically on OOM

Set `JAVA_OPTS` to `-XX:+HeapDumpOnOutOfMemoryError -XX:HeapDumpPath=/tmp`

The `/tmp` volume is maintained through restarts, so if your app is restarting because of OOM, the heap dumps can be retrieved from there.

## Manually on-demand

You can use `jmap` to create a heap dump of a running Java process.

Find a pod and exec `jmap` in it (considering PID 1 is the Java process):
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
