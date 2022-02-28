# FAQ / Troubleshooting

## First steps

If something isn't quite right, these `kubectl` commands may be of help in diagnosing and reporting errors.

To get a summary of the status of your Azure AD client:

```bash
kubectl get azureapp <app> -owide 
```

For additional details:

```bash
kubectl describe azureapp <app>
```

## Unassigned Pre-Authorized Apps

???+ quote "Example"

    You might see the following status message when running `kubectl describe azureapp <app>`:

    ```yaml
    Status:
      ...
      Pre Authorized Apps:
        ...
        Unassigned:
          Access Policy Rule:
            Application:      <other-application>
            Cluster:          <cluster>
            Namespace:        <namespace>
          Reason:             WARNING: Application '<cluster>:<namespace>:<other-application>' was not found in the Azure AD tenant (<tenant>) and will _NOT_ be pre-authorized.
        Unassigned Count:     1
    ```

???+ success "Solution / Answer"

    - Ensure that the application you're attempting to pre-authorize exists in Azure AD:
        - Run `kubectl get azureapp <other-application>` and check that the `Synchronized` field is not empty.
    - If you added the application to your access policy before it existed in Azure AD, try to [resynchronize](operations.md#forcing-resynchronization) your own application:
        - `kubectl annotate azureapp <my-application> azure.nais.io/resync=true`
    - If all else fails, ask an adult in the `#nais` channel on Slack.

## "Application `Alice` is not assigned to a role for the application `Bob`"

???+ quote "Example"

    An application may receive the following `400 Bad Request` response error when requesting a token from Azure AD:

    ```json
    {
      "error": "invalid_grant",
      "error_description": "AADSTS501051: Application '<client ID>'(<cluster>:<namespace>:<alice>) is not assigned to a role for the application 'api://<cluster>.<namespace>.<bob>'(<cluster>:<namespace>:<bob>)",
      ...
    }
    ```

    Or the other variant:

     ```json
    {
      "error": "invalid_grant",
      "error_description": "AADSTS65001: The user or administrator has not consented to use the application with ID '<client ID>' named '<cluster>:<namespace>:<alice>'. Send an interactive authorization request for this user and resource.",
      ...
    }
    ```

???+ success "Solution / Answer"

    - Ensure that Bob's [access policy](access-policy.md#pre-authorization) includes Alice.
    - Run `kubectl get azureapp bob` to check the current count of assigned and unassigned applications for Bob. 
    - Run `kubectl get azureapp bob -o json | jq '.status.preAuthorizedApps'` to check the detailed statuses for all of Bob's desired pre-authorized applications. 
    - If Bob added Alice to its access policy before Alice existed in Azure AD, try to [resynchronize](operations.md#forcing-resynchronization) Bob:
        - `kubectl annotate azureapp bob azure.nais.io/resync=true`
    - If all else fails, ask an adult in the `#nais` channel on Slack.
