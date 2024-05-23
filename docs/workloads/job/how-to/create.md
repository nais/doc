---
tags: [job, how-to]
---

# Create job

This how-to guide will show you how to create a NAIS manifest for your [job](../README.md).

## Setup

Inside your job repository, create a `.nais`-folder.

```bash
cd <MY-JOB>
mkdir .nais
```

Create a file called `job.yaml` in the `.nais`-folder.

```bash
touch .nais/job.yaml
```

## Define your job

Below is a basic example of an job manifest.

Add the following content to the file, and insert the appropriate values in the placeholders on the highlighted lines:

???+ note ".nais/app.yaml"

    ```yaml hl_lines="5-7 9"
    apiVersion: nais.io/v1
    kind: Naisjob
    metadata:
      labels:
        team: <MY-TEAM>
      name: <MY-JOB>
      namespace: <MY-TEAM>
    spec:
      schedule: "0 * * * *" # Runs every hour
      image: {{image}} # Placeholder variable to be replaced by the CI/CD pipeline
      resources:
        requests:
          cpu: 200m
          memory: 128Mi
    ```

This job manifest will run your code every hour. If you want to run your job only once, you can remove the `schedule` field.

## Related pages

:dart: [Build and deploy your job to NAIS](../../../build/how-to/build-and-deploy.md).

:books: [Job spec reference](../reference/naisjob-spec.md).

:books: [Complete job example](../reference/naisjob-example.md).
