---
description: Kubernetes security context for containers
---

# Container security context
Kubernetes restricts the capabilities of containers by using `SecurityContext` settings. This feature advances the security in the pods running on Kubernetes.

These are now opt-in in the application spec by using an annotation.
This opt-in is a temporary feature to allow you to test your application containers, 
before we make these settings default in the future. 


## Configuration
Add the annotation `nais.io/restricted: "true"` to your application spec to enable a restrictive security context:
```yaml
apiVersion: nais.io/v1alpha1
kind: Application
metadata:
  annotations:
    nais.io/restricted: "true"
```

## Default settings in the application container
```yaml
securityContext:
  runAsUser: 1069
  runAsGroup: 1069
  allowPrivilegeEscalation: false
  runAsNonRoot: true
  privileged: false
  capabilities:
    drop: ["all"]
```

## Enabling restrictive security context for all applications in namespace
This script is a quick way to enable the restrictive security context for all applications in your namespace. 
All applications will be restarted when using this script.

Execute it with the name of the namespace as the only parameter:
```bash
#!/bin/bash
# Adds restricted annotation and resynchronizes all applications in namespace
ns=$1
[ "$ns" == "" ] && exit 1
echo "namespace: $ns"
for app in $(kubectl get app -n "$ns" -o name); do
    kubectl annotate app "$app" -n "$ns" nais.io/restricted="true"
    kubectl -n "$ns"  patch "$app" -p '[{"op": "remove", "path": "/status/synchronizationHash"}]' --type=json
done
```

Verify that all your applications are running as expected after the restart. 
If you encounter issues with missing capabilities contact the nais team.

## Relevant information

[Configure security context](https://kubernetes.io/docs/tasks/configure-pod-container/security-context/)

[Docker security best practices](https://cheatsheetseries.owasp.org/cheatsheets/Docker_Security_Cheat_Sheet.html#rule-3-limit-capabilities-grant-only-specific-capabilities-needed-by-a-container)

[Security context capabilities](https://steflan-security.com/linux-privilege-escalation-exploiting-capabilities/)




