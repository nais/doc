---
tags: [workloads, how-to, access-policy]
---

# Set up access policies

Define [access policies](../explanations/zero-trust.md) for your [workload](../README.md) to allow inbound and outbound traffic.
These examples apply to workloads in the same environment.

Use the team name as the value of `namespace` in access policy rules.
If you omit `namespace`, the rule applies to your own team.

## Inbound access

### Receive requests from workloads in the same team

To allow `<MY-APP>` to receive requests from `<MY-OTHER-APP>` in your team, add this inbound rule to `<MY-APP>`:

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
      accTitle: Receive requests from another workload in the same team
      accDescr: The diagram shows two applications in the same team, MY-APP and MY-OTHER-APP. Application MY-APP is allowed to receive requests from MY-OTHER-APP.

      MY-OTHER-APP--"✅"-->MY-APP

      subgraph team
        MY-OTHER-APP
        MY-APP
      end
    ```

### Receive requests from workloads in other teams

To allow `<MY-APP>` to receive requests from `<ANOTHER-APP>` in `<ANOTHER-TEAM>`, add this inbound rule to `<MY-APP>`:

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
              namespace: <ANOTHER-TEAM>
    ```

=== "visualization"

    ```mermaid
    graph LR
      accTitle: Receive requests from another app in another team
      accDescr: The diagram shows two applications in different teams, MY-APP and ANOTHER-APP. Application MY-APP is allowed to receive requests from ANOTHER-APP.

      ANOTHER-APP--"✅"-->MY-APP

      subgraph team
        MY-APP
      end

      subgraph another-team
        ANOTHER-APP
      end
    ```

## Outbound access

### Send requests to another app in the same team

To allow `<MY-APP>` to send requests to `<MY-OTHER-APP>` in your team, add this outbound rule to `<MY-APP>`:

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
      accTitle: Send requests to another app in the same team
      accDescr: The diagram shows two applications in the same team, MY-APP and MY-OTHER-APP. Application MY-APP is allowed to send requests to MY-OTHER-APP.

      MY-APP--"✅"-->MY-OTHER-APP

      subgraph team
        MY-APP
        MY-OTHER-APP
      end
    ```

### Send requests to an app in another team

To allow `<MY-APP>` to send requests to `<ANOTHER-APP>` in `<ANOTHER-TEAM>`, add this outbound rule to `<MY-APP>`:

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
              namespace: <ANOTHER-TEAM>
    ```

=== "visualization"

    ```mermaid
    graph LR
      accTitle: Send requests to an app in another team
      accDescr: The diagram shows two applications in different teams, MY-APP and ANOTHER-APP. Application MY-APP is allowed to send requests to ANOTHER-APP.

      MY-APP--"✅"-->ANOTHER-APP

      subgraph team
        MY-APP
      end

      subgraph another-team
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
        subgraph team
          MY-APP
        end
      end
    ```

For a list of external addresses that are accessible by default, see the [access policy reference](../reference/access-policies.md#default-allowed-external-hosts).
