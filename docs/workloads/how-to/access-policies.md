---
tags: [workloads, how-to, access-policy]
---

# Set up access policies

This guide will show you how to define [access policies](../explanations/zero-trust.md) for your [workload](../README.md).

## Inbound access

### Receive requests from workloads in the same namespace

For app `<MY-APP>` to be able to receive incoming requests from `<MY-OTHER-APP>` in the same namespace, this specification is needed for `<MY-APP>`:

=== "app.yaml"

    ```yaml
    apiVersion: "nais.io/v1alpha1"
    kind: "Application"
    metadata:
      name: <MY-APP>
    ...
    spec:
      ...
      accessPolicy:
        inbound:
          rules:
            - application: <MY-OTHER-APP>
    ```

=== "visualization"

    ```mermaid
    graph LR
      accTitle: Receive requests from other workload in the same namespace
      accDescr: The diagram shows two applications in the same namespace, MY-APP and MY-OTHER-APP. Application MY-APP is allowed to receive requests from MY-OTHER-APP.

      MY-OTHER-APP--"✅"-->MY-APP

      subgraph namespace
        MY-OTHER-APP
        MY-APP
      end
    ```

### Receive requests from workloads in other namespaces

For app `<MY-APP>` to be able to receive incoming requests from `<ANOTHER-APP>` in `<ANOTHER-NAMESPACE>`, this specification is needed for `<MY-APP>`:

=== "app.yaml"

    ```yaml
    apiVersion: "nais.io/v1alpha1"
    kind: "Application"
    metadata:
      name: <MY-APP>
    ...
    spec:
      ...
      accessPolicy:
        inbound:
          rules:
            - application: <ANOTHER-APP>
              namespace: <ANOTHER-NAMESPACE>
    ```

=== "visualization"

    ```mermaid
    graph LR
      accTitle: Receive requests from other app in another namespace
      accDescr: The diagram shows two applications in different namespaces, <MY-APP> and <ANOTHER-APP>. Application <MY-APP> is allowing requests from <ANOTHER-APP>.

      ANOTHER-APP--"✅"-->MY-APP

      subgraph namespace
        MY-APP
      end

      subgraph another-namespace
        ANOTHER-APP
      end
    ```

## Outbound access

### Send requests to another app in the same namespace

For app `<MY-APP>` to be able to send requests to `<MY-OTHER-APP>` in the same namespace, this specification is needed for `<MY-APP>`:

=== "app.yaml"

    ```yaml
    apiVersion: "nais.io/v1alpha1"
    kind: "Application"
    metadata:
      name: <MY-APP>
    ...
    spec:
      ...
      accessPolicy:
        outbound:
          rules:
            - application: <MY-OTHER-APP>
    ```

=== "visualization"

    ```mermaid
    graph LR
      accTitle: Send requests to other app in the same namespace
      accDescr: The diagram shows two applications in the same namespace, <MY-APP> and <MY-OTHER-APP>. Application <MY-APP> is allowed to send requests to <MY-OTHER-APP>.

      MY-APP--"✅"-->MY-OTHER-APP

      subgraph mynamespace
        MY-APP
        MY-OTHER-APP
      end
    ```

### Send requests to other app in another namespace

For app `<MY-APP>` to be able to send requests to `<ANOTHER-APP>` in `<ANOTHER-NAMESPACE>`, this specification is needed for `<MY-APP>`:

=== "app.yaml"

    ```yaml
    apiVersion: "nais.io/v1alpha1"
    kind: "Application"
    metadata:
      name: <MY-APP>
    ...
    spec:
      ...
      accessPolicy:
        outbound:
          rules:
            - application: <ANOTHER-APP>
              namespace: <ANOTHER-NAMESPACE>
    ```

=== "visualization"

    ```mermaid
    graph LR
      accTitle: Send requests to other app in another-namespace
      accDescr: The diagram shows two applications in different namespaces, <MY-APP> and <ANOTHER-APP>. Application <MY-APP> is allowed to send requests to <ANOTHER-APP>.

      MY-APP--"✅"-->ANOTHER-APP

      subgraph mynamespace
        MY-APP
      end

      subgraph another-namespace
        ANOTHER-APP
      end
    ```

### Send requests to external addresses

For app `<MY-APP>` to be able to send requests to addresses outside the environment, this specification is needed for `<MY-APP>`:

=== "app.yaml"

    ```yaml
    apiVersion: "nais.io/v1alpha1"
    kind: "Application"
    metadata:
      name: <MY-APP>
    ...
    spec:
      ...
      accessPolicy:
        outbound:
          external:
            - host: external-application.com
    ```

=== "visualization"

    ```mermaid
    graph LR
      accTitle: External addresses
      accDescr: The diagram shows an application, <MY-APP>, that is allowed to send requests to an external address.

      MY-APP--"✅"-->external-application.com

      subgraph environment
        subgraph mynamespace
          MY-APP
        end
      end
    ```

For a list of external addresses that are accessible by default, see the [access policy reference](../reference/access-policies.md#default-allowed-external-hosts).
