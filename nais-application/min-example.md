---
description: An example of the smallest possible nais.yaml that you can have
---
# Min example

```
apiVersion: "nais.io/v1alpha1"
kind: "Application"
metadata:
  name: nais-testapp
  namespace: aura
  labels:
    team: aura
spec:
  image: navikt/nais-testapp:65.0.0
```
