If you have problems getting your pods running you should check out the official documentation from Kubernetes:

- [Troubleshoot Applications](https://kubernetes.io/docs/tasks/debug-application-cluster/debug-application/)
- [Debug Running Pods](https://kubernetes.io/docs/tasks/debug-application-cluster/debug-running-pod/)

PS: Applications in the context above is not the NAIS applications. Debugging a NAIS applications resource is done
with `kubectl describe application $app_name`.

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
