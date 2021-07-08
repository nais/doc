# Legacy

This section only applies if you have an existing Azure AD client registered in the [IaC repository](https://github.com/navikt/aad-iac).

## Why migrate?

* Declarative provisioning, straight from your application's [`nais.yaml`](../../../nais-application/application.md#azureapplication)
* No longer dependent on manual user approvals in multiple IaC repositories
* No longer dependent on Vault
* Credentials are rotated regularly, completely transparent to the application. This ensures that credentials are fresh and lessens the impact in the case of exposure.
* The exact same feature is present in the [GCP](../../../clusters/gcp.md) clusters, which simplifies [migration](../../../clusters/migrating-to-gcp.md).

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

## Migration guide - step by step

The following describes the steps needed to migrate an existing legacy client where you wish to keep the existing client ID and configuration.

If keeping the existing client ID and configuration is not important, it should be much easier to just provision new clients instead.

!!! warning
    Be aware of the [differences in tenants](concepts.md#tenants) between the [IaC repository](https://github.com/navikt/aad-iac) and NAIS:

    * `nonprod` -> `trygdeetaten.no`
    * `prod` -> `nav.no`

???+ check "Step 1 - Rename your application in the Azure Portal"
    The `Display name` of the application registered in the [Azure Portal](https://portal.azure.com/#blade/Microsoft_AAD_IAM/ActiveDirectoryMenuBlade/RegisteredApps) **must** match the [expected format](concepts.md#naming-format).

    * Go to the **`Branding`** tab for your client in the [Azure Portal](https://portal.azure.com/#blade/Microsoft_AAD_IAM/ActiveDirectoryMenuBlade/RegisteredApps).
    * Update the `Name`.

???+ check "Step 2 - Update your application \(and any dependants\) in the IaC repository"

    * Ensure the **`name`** of the client registered in the [IaC repository](https://github.com/navikt/aad-iac) is updated to match the name set in **step 1**.
    * Ensure that any clients that has a reference to the previous name in their **`preauthorizedapplications`** is also updated. 

???+ check "Step 3 - Deploy your NAIS application with Azure AD provisioning enabled"

    * See [getting started](configuration.md#getting-started).

???+ check "Step 4 - Delete your application from the IaC repository"

    * Verify that everything works after the migration
    * Delete the application from the [IaC repository](https://github.com/navikt/aad-iac) in order to maintain a single source of truth
