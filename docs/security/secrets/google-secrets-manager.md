# Google Secrets Manager

!!! warning
    Google Secrets Manager integration with Kubernetes is currently available as an OPEN BETA.
    Please report any issues to the #nais channel on Slack.

You may store secrets in [Google Secrets Manager](https://cloud.google.com/secret-manager) as an alternative to the
other offered solutions.

As a supplement to [Kubernetes Secrets](kubernetes-secrets.md), we also offer one-way 
synchronization of secrets from Google Secrets Manager to Kubernetes Secrets
that you may mount into your applications in the GCP clusters.

## Getting started

### Step 1: Create a Secret in Google Secret Manager

???+ check

    Start at the [GCP Console](https://console.cloud.google.com/security/secret-manager) page and
    refer to the [documentation](https://cloud.google.com/secret-manager/docs/quickstart#secretmanager-quickstart-web) for
    guides and how-tos on creating and managing secrets.

    All secrets must exist in the region `europe-north1`. 
    
    This option is found when you click _manually select region_. 

    ![Google Secret Manager Region selection](../../assets/google-secret-manager-region.png)

    Unfortunately, we cannot enforce a default value here.

### Step 2: Import Secret to Kubernetes

!!! warning "Only available in GCP"
    Importing a secret to Kubernetes is only possible in the [GCP clusters](../../clusters/gcp.md).

!!! warning "One-way Synchronization"
    The secret in Google Secret Manager is the single source of truth.

    Modifications to the secret in Kubernetes will NOT be synchronized back to Google Secret Manager.

    Any modifications done in Kubernetes will be overwritten by the actual secret found in Google Secret Manager.

???+ check

    #### Enable synchronization

    Label your Secret with `sync=true` to enable synchronization to NAIS:
    
    ![Google Secret Manager Sync label](../../assets/google-secret-manager-sync-label.png)

    !!! info 
        Synchronization only occurs when new _secret versions_ are created.

        If the secret already existed without this label, you must create a new _secret
        version_ to effectuate the sync.

    The latest _secret version_ in Google Secret Manager will be copied into your Kubernetes namespace as a [Kubernetes Secret](kubernetes-secrets.md).

    #### Secret Naming

    The name of the secret in Kubernetes will match the name of the secret in Google Secret Manager. 

    !!! warning "Naming collisions"
        If a secret with the same name already exists in Kubernetes, the secret will not be imported.

### Step 2a: Secrets formatted as environment variables

???+ check

    If your secret contains a list of environment variables:

    ![Google Secret Manager environment variables example](../../assets/google-secret-manager-env-value.png)

    Then additionally add the label `env=true` to your secret in Google Secret Manager:

    ![Google Secret Manager environment variables label](../../assets/google-secret-manager-env-label.png)

    This tells the synchronization mechanism to parse the secret as environment variables.

### Step 3: Using the Kubernetes Secret in your applications

???+ check
    Now that the Secret exists in your Kubernetes namespace, your application may refer to and use it.

    There are two ways of mounting/exposing a Kubernetes Secret to your application:

    - as files, or 
    - as environment variables

    #### Files

    ```yaml
    spec:
      # secret will be available in the file named "secret"
      # in the directory /var/run/secrets/my-secret/
      filesFrom:
        - secret: my-google-secret # secret name in Google Secret Manager
          mountPath: /var/run/secrets/my-secret
    ```

    #### Environment variables

    ```yaml
    spec:
      # secret will be made available as environment variables
      envFrom:
        - secret: my-google-secret # secret name in Google Secret Manager
    ```

### Examples

#### Example secret with single value format

??? example "Secret in Google Secret Manager (click to expand)"
    
    ![Google Secret Manager secret with single value](../../assets/google-secret-manager-example-single-value.png)

??? example "Imported Secret in Kubernetes (click to expand)"
    
    ```yaml
    apiVersion: v1
    data:
      secret: c29tZS1zZWNyZXQtdmFsdWU= 
      # key="secret"
      # value="some-secret-value", base64 encoded
    kind: Secret
    metadata:
      annotations:
        hunter2.nais.io/last-modified: "2021-03-25T08:04:19Z"
        hunter2.nais.io/last-modified-by: user@nav.no
        hunter2.nais.io/secret-version: "1"
      creationTimestamp: "2021-03-25T08:04:25Z"
      labels:
        nais.io/created-by: hunter2
      name: my-google-secret
      namespace: my-team
    type: Opaque
    ```

??? example "Secret values when mounted to application (click to expand)"

    ```yaml
    spec:
      # secret will be available in the file named "secret" in the directory /var/run/secrets/my-secret/
      # e.g. /var/run/secrets/my-secret/secret
      filesFrom:
        - secret: my-google-secret # secret name in Google Secret Manager
          mountPath: /var/run/secrets/my-secret

      # secret will be made available as environment variable named "secret"
      # secret=some-secret-value
      envFrom:
        - secret: my-google-secret # secret name in Google Secret Manager
    ```

#### Example with environment variable format

??? example "Secret in Google Secret Manager (click to expand)"

    ![Google Secret Manager secret with environment variables](../../assets/google-secret-manager-example-env.png)

??? example "Imported Secret in Kubernetes (click to expand)"

    ```yaml
    apiVersion: v1
    data:
      SOME_ENV: c29tZS1zZWNyZXQtdmFsdWU=
      # key="SOME_ENV"
      # value="some-secret-value", base64 encoded
      SOME_OTHER_ENV: c29tZS1vdGhlci1zZWNyZXQ=
      # key="SOME_OTHER_ENV"
      # value="some-other-secret", base64 encoded
    kind: Secret
    metadata:
      annotations:
        hunter2.nais.io/last-modified: "2021-03-25T08:24:58Z"
        hunter2.nais.io/last-modified-by: user@nav.no
        hunter2.nais.io/secret-version: "2"
      creationTimestamp: "2021-03-25T08:04:25Z"
      labels:
        nais.io/created-by: hunter2
      name: my-google-secret
      namespace: my-team
    type: Opaque
    ```

??? example "Secret values when mounted to application (click to expand)"

    ```yaml
    spec:
      # secret will be available as files in the directory /var/run/secrets/my-secret/
      # e.g. /var/run/secrets/my-secret/SOME_ENV and /var/run/secrets/my-secret/SOME_OTHER_ENV
      filesFrom:
        - secret: my-google-secret # secret name in Google Secret Manager
          mountPath: /var/run/secrets/my-secret

      # secret will be made available as environment variables
      # SOME_ENV=some-secret-value
      # SOME_OTHER_ENV=some-other-secret
      envFrom:
        - secret: my-google-secret # secret name in Google Secret Manager
    ```
