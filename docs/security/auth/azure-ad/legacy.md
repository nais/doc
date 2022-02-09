# Legacy

This section only applies if you have an existing Azure AD client registered in the [IaC repository](https://github.com/navikt/aad-iac).

## Pre-authorization

Communication between legacy clients provisioned through [aad-iac](https://github.com/navikt/aad-iac) and clients provisioned through NAIS requires some additional configuration.

???+ info "Scenario 1"

    #### Allowing a NAIS client to access an aad-iac client

    Prerequisites:

    * You have a legacy client registered in the [`aad-iac`](https://github.com/navikt/aad-iac) repository.
    * You would like to [pre-authorize](access-policy.md#pre-authorization) client provisioned through NAIS.

    Steps:

    * Refer to the NAIS client in aad-iac using its _fully qualified name_ \(see [naming format](concepts.md#naming-format)\):
    
    ```
    <cluster>:<namespace>:<app-name>
    ```
    
    Example:    

    * See [this example in aad-iac](https://github.com/navikt/aad-iac/blob/073664fc5e455c17f1a33ec394c4f07464ae0a2f/prod/hookd.yaml#L4-L5).

---

???+ info "Scenario 2"

    #### Allowing an aad-iac client to access a NAIS client

    Prerequisites:

    * You have a client provisioned through NAIS.
    * You would like to [pre-authorize](access-policy.md#pre-authorization) a legacy client registered in the [`aad-iac`](https://github.com/navikt/aad-iac) repository.

    Steps:

    * The legacy client **must** follow the expected [naming format](concepts.md#naming-format). Follow step 1 and step 2 in the [migration guide](#migration-guide-step-by-step).
    * Refer to the legacy client [analogously to a NAIS application](access-policy.md#pre-authorization)
    
    Example:
    
    * See [this example in aad-iac](https://github.com/navikt/aad-iac/blob/8972c11dd23158aab0cae2f080d77869137eb809/nonprod/team-rocket.yaml#L2)
    * Pre-authorizing the legacy client in nais.yaml:

    ```yaml
    spec:
      accessPolicy:
        inbound:
          rules:
          - application: dkif
            namespace: team-rocket
            cluster: dev-fss
    ```

## Migration

If you have an existing legacy client in [aad-iac](https://github.com/navikt/aad-iac) and wish to keep the current client ID and configuration when moving to NAIS, [contact us](../../../support.md) on Slack for assistance.

If keeping the existing client ID and configuration is not important, it should be much easier to just [provision new clients](configuration.md#getting-started) instead.
