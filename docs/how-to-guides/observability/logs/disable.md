---
description: Disable log storage for a specific application
tags: [guide, observability, logs]
---
# Disable persistent application logs

This guide will help you disable persistent log storage for an application. This is useful if you have an application whose logs are not useful or are causing too much noise in the logs.

!!! warning
    Disabling logging will not affect the application's ability to log to stdout/stderr that can still be found in nais console or using the `kubectl logs` command. It will only disable the persistent storage of logs.

Simply set the `spec.observability.logging.destinations` in your application manifest to an empty list to disable logging.

???+ note ".nais/application.yaml"
    ```yaml hl_lines="6"
    …
    spec:
      observability:
        logging:
          destinations: []
    ```
