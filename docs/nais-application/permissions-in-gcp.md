# Permissions in Google Cloud Platform

Identity & Access Mangement (IAM) lets you create and manage permissions for Google Cloud resources on the Google Cloud
Platform (GCP). 

!!! info
    Please read through the [Google Cloud IAM documentation] for a more thorough introduction to IAM and 
    related concepts.

Most services (e.g. [PostgreSQL](../persistence/postgres.md), [Cloud Storage / Buckets](../persistence/buckets.md), 
[BigQuery](../persistence/bigquery.md)) offered by NAIS on GCP will automatically be configured with any needed 
permissions that allows your application to access them.

In cases where you wish to use other services in the Google Cloud Platform not officially supported by NAIS, you will
also have to set up permissions that allows your application to access these resources.

## Concepts

### Permissions

See <https://cloud.google.com/iam/docs/overview#permissions>.

### Roles

See <https://cloud.google.com/iam/docs/overview#roles>.

See also [Google Cloud Predefined Roles] for a list of predefined roles.

### Policy Granularity

Google Cloud resources are organized hierarchically. A policy that grants a principal (a user or a service account) any
permissions to a resource will thus also apply to any children of said resource. This allows for fine-grained access
control.

For example, you may grant the `roles/pubsub.subscriber` role for your application at the project-level. This means that
the application will have the role for _any_ PubSub subscription for the entire project. If you instead grant the same
role at the subscription-level, the application would only have access to a specific PubSub subscription.

See <https://cloud.google.com/iam/docs/overview#resource-hierarchy>.

### Service Accounts

Applications running on Kubernetes (which is the runtime platform at the core of NAIS) each have an associated
_[Kubernetes Service Account]_ (KSA). This account provides an identity for the individual applications running on the
platform.

To access the various Google Cloud resources, a _[Google Service Account]_ (GSA) is required. For simplicity's sake, NAIS
automatically provisions Google Service Accounts for each application that is deployed to
the [GCP clusters](../clusters/gcp.md). The Google Service Account is uniquely identified by its _email address_:

```
<service-account-name>@<project-id>.iam.gserviceaccount.com
```

You can find this email for your application's GSA by querying the clusters. Ensure that you have set
up [access to the Kubernetes clusters](../basics/access.md) first, then run the following command:

```shell
kubectl get sa <app> \
  -ojsonpath="{.metadata.annotations.\iam\.gke\.io/gcp-service-account}" \
  -n <namespace>
```

### Authentication

In order to _authenticate_ using the identity of the Google Service Account, we need a set of _credentials_. The
documentation on Google Cloud Platform mention several [best practices][Google Service Account Best Practices] for
managing such credentials. One of these practices is to use [_workload identity_][Workload Identity].

Workload identity works by essentially creating a mapping between a Kubernetes Service Account and a Google Service Account. 
In other words, your application can authenticate itself with the Kubernetes Service Account credentials, and access 
Google Cloud APIs with the identity of the Google Service Account.

If your application uses the official [Google Client Libraries], the library will automatically discover and handle
authentication.

For local development, you can acquire credentials for your own user account by using
[Application Default Credentials]. Your application will then automatically discover and use these when running locally.
Ensure that your user has the [required permissions or roles][Google Cloud Managing Access] to access the Google Cloud
resources and APIs used by your application.

## Granting permissions

There are multiple ways of granting your application access to Google Cloud resources.

### Declaratively

The [NAIS application manifest](application.md#gcppermissions) allows for basic configuration to 
grant roles to your application roles. This can either apply for a specific resource or for the entire project. 
To do so, you need the following information:

| Field      | Description                                                                                                                                                              | Example value                                                                             |
|:-----------|:-------------------------------------------------------------------------------------------------------------------------------------------------------------------------|:------------------------------------------------------------------------------------------|
| Kind       | The Config Connector Resource Name. See [the list of supported resources][IAMPolicyMember Supported Resources].                                                          | `KMSCryptoKey`                                                                            |
| APIVersion | The APIVersion for the Config Connector Resource Name. See the [list of resources][Config Connector resources] and visit the individual resource page for details.       | `kms.cnrm.cloud.google.com/v1beta1` ([source][KMSCryptoKey APIVersion Example])           |
| Role       | See [predefined roles][Google Cloud Predefined Roles] for a list of available predefined roles for each resource.                                                        | `cloudkms.cryptoKeyEncrypterDecrypter`                                                    |
| Name       | The resource name or reference in Google Cloud. Not needed for project-wide access. See the table for [external reference formats][IAMPolicyMember Supported Resources]. | `projects/<project-ID>/locations/<location>/keyRings/<key-ring-ID>/cryptoKeys/<key-name>` |

=== "Project-wide access"

    For example:

    ```yaml
    spec:
      gcp:
        permissions:
          - resource:
              apiVersion: resourcemanager.cnrm.cloud.google.com/v1beta1
              kind: Project
            role: roles/cloudkms.cryptoKeyEncrypterDecrypter
    ```

    The above example grants your application the role `roles/cloudkms.cryptoKeyEncrypterDecrypter` at the project level. This means
    that your application will have this role for any Cloud KMS resource in your project.

    Note that the `name` field is omitted as it is automatically inferred.

=== "Specific resource access"

    If you only want your application to be able to access a specific key in Cloud KMS, the example would look like this:

    ```yaml
    spec:
      gcp:
        permissions:
          - resource:
              apiVersion: kms.cnrm.cloud.google.com/v1beta1
              kind: KMSCryptoKey
              name: locations/europe-north1/keyRings/<some-key-ring>/cryptoKeys/<some-key>
            role: roles/cloudkms.cryptoKeyEncrypterDecrypter
    ```

    Note that you can omit the `project/<project ID>/`-prefix from the `name` value, as shown in the example. The prefix 
    is automatically inferred by the NAIS platform.

### Cloud Console

See the Google Cloud documentation for granting access to either [projects][Google Cloud Managing Access]
or [lower level resources][Google Cloud Managing Access Other Resources].

[Google Cloud IAM documentation]: https://cloud.google.com/iam/docs/overview
[Kubernetes Service Account]: https://kubernetes.io/docs/tasks/configure-pod-container/configure-service-account/
[Google Service Account]: https://cloud.google.com/iam/docs/service-accounts
[Google Service Account Best Practices]: https://cloud.google.com/iam/docs/best-practices-for-managing-service-account-keys
[Workload Identity]: https://cloud.google.com/kubernetes-engine/docs/concepts/workload-identity
[Google Client Libraries]: https://cloud.google.com/apis/docs/client-libraries-explained
[Application Default Credentials]: https://cloud.google.com/sdk/gcloud/reference/auth/application-default
[Google Cloud Managing Access]: https://cloud.google.com/iam/docs/granting-changing-revoking-access
[Google Cloud Managing Access Other Resources]: https://cloud.google.com/iam/docs/manage-access-other-resources
[Google Cloud Predefined Roles]: https://cloud.google.com/iam/docs/understanding-roles#predefined
[IAMPolicyMember Supported Resources]: https://cloud.google.com/config-connector/docs/reference/resource-docs/iam/iampolicymember#supported_resources
[Config Connector resources]: https://cloud.google.com/config-connector/docs/reference/overview
[KMSCryptoKey APIVersion Example]: https://cloud.google.com/config-connector/docs/reference/resource-docs/kms/kmscryptokey#sample_yamls
