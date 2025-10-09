---
tags: [how-to, kafka]
not-in: [test-nais]
---

# Manage access

This guide will show you how to manage access to your topic.

## Prerequisites

- [An existing topic](create.md) to manage access to.

## Add ACLs to your topic

!!! info
    It is possible to use simple wildcards (`*`) in both team and application names, which matches any character any number of times.
    Be aware that due to the way ACLs are generated and length limits, the ends of long names can be cut, eliminating any wildcards at the end.

Example of various ACLs:

???+ note ".nais/topic.yaml"

    ```yaml
    ...
    apiVersion: nais.io/v1alpha1
    kind: Topic
    ...
    spec:
      acl:
      - team: <ANOTHER-TEAM>
        application: <CONSUMER-APP>
        access: read
      - team: <ANOTHER-TEAM>
        application: <CONSUMER-APP2>
        access: read
      - team: <ANOTHER-TEAM>
        application: <PRODUCER-APP> 
        access: write
      - team: <PRODUCER-TEAM>
        application: <PRODUCER-APP> 
        access: write
      - team: <TRUSTED-TEAM>
        application: *
        access: read     # ALL applications from this trusted-team has read
      - team: *
        application: <APPLICATION-NAME>
        access: read     # Applications named <APPLICATION-NAME> from ANY team has read
      - team: <MY-TEAM>
        application: rapid-*
        access: readwrite   # ALL applications from <MY-TEAM> with names starting with `rapid-` has readwrite access
      ...
    ```

## Apply the Topic resource
=== "Automatically"
    Add the file to your application repository to deploy with [Nais github action](../../../build/how-to/build-and-deploy.md).
=== "Manually"
    ```bash
    kubectl apply -f ./nais/topic.yaml --namespace=<MY-TEAM> --context=<MY-CLUSTER>
    ```
