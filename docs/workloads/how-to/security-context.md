---
tags: [workloads, how-to, security, context]
---

# Container security context

Kubernetes restricts the capabilities of containers by using `SecurityContext` settings. This feature advances the security in the pods running on Kubernetes.

By default we set the following `securityContext` in the PodSpec for the application container:

| setting                  | value         |
|--------------------------|---------------|
| runAsUser                | 1069          |
| runAsGroup               | 1069          |
| allowPrivilegeEscalation | false         |
| readOnlyRootFilesystem   | true          |
| runAsNonRoot             | true          |
| privileged               | false         |
| capabilities             | drop: ["all"] |

## Enable specific kernel capabilities

Enable specific kernel capabilities by adding the following annotation to your `Application` or `NaisJob` spec:
```yaml
apiVersion: nais.io/v1alpha1
kind: Application
metadata:
  annotations:
    nais.io/add-kernel-capability: "NET_RAW"
```

The annotation supports multiple values separated by comma. 
Not all capabilities are supported, so if you encounter issues with missing capabilities contact the nais team.

They are found in the [list of capabilities](https://steflan-security.com/linux-privilege-escalation-exploiting-capabilities/)

## Disable read-only file system

By default, the only writable path on the file system is `/tmp`. 
If your application requires writing to another location, it is possible to enable this by setting the following annotation:

```yaml
apiVersion: nais.io/v1alpha1
kind: Application
metadata:
  annotations:
    nais.io/read-only-file-system: "false"
```

Note that even though the file system is writable, the default user `1069` (or whatever you override it with) needs write permission inside the docker image.

## Overriding runAsUser / runAsGroup

By default the container runs with user and group id `1069`. If you need to override this for your container, you can add the following annotations to your `Application`.

```yaml
apiVersion: nais.io/v1alpha1
kind: Application
metadata:
  annotations:
    nais.io/run-as-user: "1001"
    nais.io/run-as-group: "1002"
```

The `nais.io/run-as-group` will default to what you specify as `nais.io/run-as-user`.

## Relevant information
[Configure security context](https://kubernetes.io/docs/tasks/configure-pod-container/security-context/)

[Docker security best practices](https://cheatsheetseries.owasp.org/cheatsheets/Docker_Security_Cheat_Sheet.html#rule-3-limit-capabilities-grant-only-specific-capabilities-needed-by-a-container)
