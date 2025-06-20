Upgrade major version
=====================

When the OpenSearch instance was created, it was set up with the major version that was current at the time.
If you want to upgrade to a newer major version, you can do so by setting the version in the OpenSearch resource:

???+ note "opensearch.yaml"
    ```yaml hl_lines="12"
    apiVersion: aiven.io/v1alpha1
    kind: OpenSearch
    metadata:
      labels:
        team: myteam
      name: opensearch-myteam-myinstance
      namespace: myteam
    spec:
      plan: hobbyist
      project: nav-dev
      userConfig:
        opensearch_version: "2"
    ```

Check out the [OpenSearch resource documentation](https://aiven.github.io/aiven-operator/resources/opensearch.html#spec.userConfig) for more details on the `userConfig` field and other available options.
