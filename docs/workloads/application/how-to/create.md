---
tags: [application, how-to]
---

# Create application

This how-to guide will show you how to create a NAIS manifest for your [application](../README.md).

## Setup

Inside your application repository, create a `.nais`-folder.

```bash
cd <MY-APP>
mkdir .nais
```

Create a file called `app.yaml` in the `.nais`-folder.

```bash
touch .nais/app.yaml
```

## Define your application

Below is a basic example of an application manifest.

Add the following content to the file, and insert the appropriate values in the placeholders on the highlighted lines:

???+ note ".nais/app.yaml"

    ```yaml hl_lines="5-7 9"
    apiVersion: nais.io/v1alpha1
    kind: Application
    metadata:
      labels:
        team: <MY-TEAM>
      name: <MY-APP>
      namespace: <MY-TEAM>
    spec:
      image: {{image}} # Placeholder variable to be replaced by the CI/CD pipeline
      port: 8080
      replicas:
        max: 2
        min: 4
      resources:
        requests:
          cpu: 200m
          memory: 128Mi
    ```

This application manifest represents a very basic daemon application. 
You will likely want to add more configuration to your application manifest based on your needs.

## Related pages

:dart: [Build and deploy your application to NAIS](../../../build/how-to/build-and-deploy.md).

:dart: [Expose your application](./expose.md).

:books: [Application spec reference](../reference/application-spec.md).

:books: [Full Application example](../reference/application-example.md).

:bulb: [Good practices for NAIS workloads](../../explanations/good-practices.md).
