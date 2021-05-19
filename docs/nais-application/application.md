# Application spec reference

## accessPolicy
By default, no traffic is allowed between applications inside the cluster. Configure access policies to allow specific applications.

Relevant information:

* [https://doc.nais.io/appendix/zero-trust/](https://doc.nais.io/appendix/zero-trust/)

Type: `object`<br />
Required: `false`<br />
Availability: GCP<br />

??? example
    ``` yaml
    spec:
      accessPolicy:
        inbound:
          rules:
          - application: app1
          - application: app2
            namespace: q1
          - application: app3
            cluster: dev-gcp
            namespace: q2
          - application: '*'
            namespace: q3
        outbound:
          external:
          - host: external-application.example.com
          - host: non-http-service.example.com
            ports:
            - name: kafka
              port: 9200
              protocol: TCP
          rules:
          - application: app1
          - application: app2
            namespace: q1
          - application: app3
            cluster: dev-gcp
            namespace: q2
          - application: '*'
            namespace: q3
    ```

### accessPolicy.inbound
Type: `object`<br />
Required: `false`<br />

??? example
    ``` yaml
    spec:
      accessPolicy:
        inbound:
          rules:
          - application: app1
          - application: app2
            namespace: q1
          - application: app3
            cluster: dev-gcp
            namespace: q2
          - application: '*'
            namespace: q3
    ```

#### accessPolicy.inbound.rules
Type: `array`<br />
Required: `true`<br />

??? example
    ``` yaml
    spec:
      accessPolicy:
        inbound:
          rules:
          - application: app1
          - application: app2
            namespace: q1
          - application: app3
            cluster: dev-gcp
            namespace: q2
          - application: '*'
            namespace: q3
    ```

##### accessPolicy.inbound.rules[].application
Type: `string`<br />
Required: `false`<br />

??? example
    ``` yaml
    spec:
      accessPolicy:
        inbound:
          rules:
          - application: app1
          - application: app2
            namespace: q1
          - application: app3
            cluster: dev-gcp
            namespace: q2
          - application: '*'
            namespace: q3
    ```

##### accessPolicy.inbound.rules[].cluster
Type: `string`<br />
Required: `false`<br />

??? example
    ``` yaml
    spec:
      accessPolicy:
        inbound:
          rules:
          - application: app1
          - application: app2
            namespace: q1
          - application: app3
            cluster: dev-gcp
            namespace: q2
          - application: '*'
            namespace: q3
    ```

##### accessPolicy.inbound.rules[].namespace
Type: `string`<br />
Required: `false`<br />

??? example
    ``` yaml
    spec:
      accessPolicy:
        inbound:
          rules:
          - application: app1
          - application: app2
            namespace: q1
          - application: app3
            cluster: dev-gcp
            namespace: q2
          - application: '*'
            namespace: q3
    ```

### accessPolicy.outbound
Type: `object`<br />
Required: `false`<br />

??? example
    ``` yaml
    spec:
      accessPolicy:
        outbound:
          external:
          - host: external-application.example.com
          - host: non-http-service.example.com
            ports:
            - name: kafka
              port: 9200
              protocol: TCP
          rules:
          - application: app1
          - application: app2
            namespace: q1
          - application: app3
            cluster: dev-gcp
            namespace: q2
          - application: '*'
            namespace: q3
    ```

#### accessPolicy.outbound.external
Type: `array`<br />
Required: `false`<br />

??? example
    ``` yaml
    spec:
      accessPolicy:
        outbound:
          external:
          - host: external-application.example.com
          - host: non-http-service.example.com
            ports:
            - name: kafka
              port: 9200
              protocol: TCP
    ```

##### accessPolicy.outbound.external[].host
Type: `string`<br />
Required: `false`<br />

??? example
    ``` yaml
    spec:
      accessPolicy:
        outbound:
          external:
          - host: external-application.example.com
          - host: non-http-service.example.com
            ports:
            - name: kafka
              port: 9200
              protocol: TCP
    ```

##### accessPolicy.outbound.external[].ports
Type: `array`<br />
Required: `false`<br />

??? example
    ``` yaml
    spec:
      accessPolicy:
        outbound:
          external:
          - host: external-application.example.com
          - host: non-http-service.example.com
            ports:
            - name: kafka
              port: 9200
              protocol: TCP
    ```

###### accessPolicy.outbound.external[].ports[].name
Type: `string`<br />
Required: `false`<br />

??? example
    ``` yaml
    spec:
      accessPolicy:
        outbound:
          external:
          - host: external-application.example.com
          - host: non-http-service.example.com
            ports:
            - name: kafka
              port: 9200
              protocol: TCP
    ```

###### accessPolicy.outbound.external[].ports[].port
Type: `integer`<br />
Required: `false`<br />

??? example
    ``` yaml
    spec:
      accessPolicy:
        outbound:
          external:
          - host: external-application.example.com
          - host: non-http-service.example.com
            ports:
            - name: kafka
              port: 9200
              protocol: TCP
    ```

###### accessPolicy.outbound.external[].ports[].protocol
Type: `enum`<br />
Required: `false`<br />
Allowed values: `GRPC`, `HTTP`, `HTTP2`, `HTTPS`, `MONGO`, `TCP`, `TLS`<br />

??? example
    ``` yaml
    spec:
      accessPolicy:
        outbound:
          external:
          - host: external-application.example.com
          - host: non-http-service.example.com
            ports:
            - name: kafka
              port: 9200
              protocol: TCP
    ```

#### accessPolicy.outbound.rules
Type: `array`<br />
Required: `false`<br />

??? example
    ``` yaml
    spec:
      accessPolicy:
        outbound:
          rules:
          - application: app1
          - application: app2
            namespace: q1
          - application: app3
            cluster: dev-gcp
            namespace: q2
          - application: '*'
            namespace: q3
    ```

##### accessPolicy.outbound.rules[].application
Type: `string`<br />
Required: `false`<br />

??? example
    ``` yaml
    spec:
      accessPolicy:
        outbound:
          rules:
          - application: app1
          - application: app2
            namespace: q1
          - application: app3
            cluster: dev-gcp
            namespace: q2
          - application: '*'
            namespace: q3
    ```

##### accessPolicy.outbound.rules[].cluster
Type: `string`<br />
Required: `false`<br />

??? example
    ``` yaml
    spec:
      accessPolicy:
        outbound:
          rules:
          - application: app1
          - application: app2
            namespace: q1
          - application: app3
            cluster: dev-gcp
            namespace: q2
          - application: '*'
            namespace: q3
    ```

##### accessPolicy.outbound.rules[].namespace
Type: `string`<br />
Required: `false`<br />

??? example
    ``` yaml
    spec:
      accessPolicy:
        outbound:
          rules:
          - application: app1
          - application: app2
            namespace: q1
          - application: app3
            cluster: dev-gcp
            namespace: q2
          - application: '*'
            namespace: q3
    ```

## azure
Type: `object`<br />
Required: `false`<br />

??? example
    ``` yaml
    spec:
      azure:
        application:
          claims:
            extra:
            - NAVident
            - azp_name
            groups:
            - id: 00000000-0000-0000-0000-000000000000
          enabled: true
          replyURLs:
          - https://myapplication.nav.no/oauth2/callback
          tenant: nav.no
    ```

### azure.application
Configures an Azure AD client for this application. See [Azure AD](https://doc.nais.io/security/auth/azure-ad/) for more details.

Type: `object`<br />
Required: `true`<br />

??? example
    ``` yaml
    spec:
      azure:
        application:
          claims:
            extra:
            - NAVident
            - azp_name
            groups:
            - id: 00000000-0000-0000-0000-000000000000
          enabled: true
          replyURLs:
          - https://myapplication.nav.no/oauth2/callback
          tenant: nav.no
    ```

#### azure.application.claims
Claims defines additional configuration of the emitted claims in tokens returned to the AzureAdApplication

Type: `object`<br />
Required: `false`<br />

??? example
    ``` yaml
    spec:
      azure:
        application:
          claims:
            extra:
            - NAVident
            - azp_name
            groups:
            - id: 00000000-0000-0000-0000-000000000000
    ```

##### azure.application.claims.extra
Extra is a list of additional claims to be mapped from an associated claim-mapping policy.

Type: `array`<br />
Required: `false`<br />

??? example
    ``` yaml
    spec:
      azure:
        application:
          claims:
            extra:
            - NAVident
            - azp_name
    ```

##### azure.application.claims.groups
Groups is a list of Azure AD group IDs to be emitted in the 'Groups' claim.

Type: `array`<br />
Required: `false`<br />

??? example
    ``` yaml
    spec:
      azure:
        application:
          claims:
            groups:
            - id: 00000000-0000-0000-0000-000000000000
    ```

###### azure.application.claims.groups[].id
Type: `string`<br />
Required: `false`<br />

??? example
    ``` yaml
    spec:
      azure:
        application:
          claims:
            groups:
            - id: 00000000-0000-0000-0000-000000000000
    ```

#### azure.application.enabled
Type: `boolean`<br />
Required: `true`<br />
Default value: `false`<br />

??? example
    ``` yaml
    spec:
      azure:
        application:
          enabled: true
    ```

#### azure.application.replyURLs
Type: `array`<br />
Required: `false`<br />

??? example
    ``` yaml
    spec:
      azure:
        application:
          replyURLs:
          - https://myapplication.nav.no/oauth2/callback
    ```

#### azure.application.tenant
Type: `enum`<br />
Required: `false`<br />
Allowed values: `nav.no`, `trygdeetaten.no`<br />

??? example
    ``` yaml
    spec:
      azure:
        application:
          tenant: nav.no
    ```

## elastic
Type: `object`<br />
Required: `false`<br />

??? example
    ``` yaml
    spec:
      elastic:
        instance: my-elastic-instance
    ```

### elastic.instance
Provisions an Elasticsearch instance and configures your application so it can access it. Use the `instance_name` that you specified in the [navikt/aiven-iac](https://github.com/navikt/aiven-iac) repository.

Type: `string`<br />
Required: `true`<br />
Availability: GCP<br />

??? example
    ``` yaml
    spec:
      elastic:
        instance: my-elastic-instance
    ```

## env
Custom environment variables injected into your container.

Type: `array`<br />
Required: `false`<br />

??? example
    ``` yaml
    spec:
      env:
      - name: MY_CUSTOM_VAR
        value: some_value
      - name: MY_APPLICATION_NAME
        valueFrom:
          fieldRef:
            fieldPath: metadata.name
    ```

### env[].name
Type: `string`<br />
Required: `false`<br />

??? example
    ``` yaml
    spec:
      env:
      - name: MY_CUSTOM_VAR
        value: some_value
      - name: MY_APPLICATION_NAME
        valueFrom:
          fieldRef:
            fieldPath: metadata.name
    ```

### env[].value
Type: `string`<br />
Required: `false`<br />

??? example
    ``` yaml
    spec:
      env:
      - name: MY_CUSTOM_VAR
        value: some_value
      - name: MY_APPLICATION_NAME
        valueFrom:
          fieldRef:
            fieldPath: metadata.name
    ```

### env[].valueFrom
Type: `object`<br />
Required: `false`<br />

??? example
    ``` yaml
    spec:
      env:
      - name: MY_CUSTOM_VAR
        value: some_value
      - name: MY_APPLICATION_NAME
        valueFrom:
          fieldRef:
            fieldPath: metadata.name
    ```

#### env[].valueFrom.fieldRef
Type: `object`<br />
Required: `true`<br />

??? example
    ``` yaml
    spec:
      env:
      - name: MY_CUSTOM_VAR
        value: some_value
      - name: MY_APPLICATION_NAME
        valueFrom:
          fieldRef:
            fieldPath: metadata.name
    ```

##### env[].valueFrom.fieldRef.fieldPath
Type: `enum`<br />
Required: `true`<br />
Allowed values: _(empty string)_, `metadata.annotations`, `metadata.labels`, `metadata.name`, `metadata.namespace`, `spec.nodeName`, `spec.serviceAccountName`, `status.hostIP`, `status.podIP`<br />

??? example
    ``` yaml
    spec:
      env:
      - name: MY_CUSTOM_VAR
        value: some_value
      - name: MY_APPLICATION_NAME
        valueFrom:
          fieldRef:
            fieldPath: metadata.name
    ```

## envFrom
Will expose all variables in ConfigMap or Secret resource as environment variables. One of `configmap` or `secret` is required.

Type: `array`<br />
Required: `false`<br />
Availability: team namespaces<br />

??? example
    ``` yaml
    spec:
      envFrom:
      - secret: my-secret-with-envs
      - configmap: my-configmap-with-envs
    ```

### envFrom[].configmap
Type: `string`<br />
Required: `false`<br />

??? example
    ``` yaml
    spec:
      envFrom:
      - secret: my-secret-with-envs
      - configmap: my-configmap-with-envs
    ```

### envFrom[].secret
Type: `string`<br />
Required: `false`<br />

??? example
    ``` yaml
    spec:
      envFrom:
      - secret: my-secret-with-envs
      - configmap: my-configmap-with-envs
    ```

## filesFrom
List of ConfigMap or Secret resources that will have their contents mounted into the containers as files. Either `configmap` or `secret` is required.

Type: `array`<br />
Required: `false`<br />
Availability: team namespaces<br />

??? example
    ``` yaml
    spec:
      filesFrom:
      - configmap: example-files-configmap
        mountPath: /var/run/configmaps
      - mountPath: /var/run/secrets
        secret: my-secret-file
    ```

### filesFrom[].configmap
Type: `string`<br />
Required: `false`<br />

??? example
    ``` yaml
    spec:
      filesFrom:
      - configmap: example-files-configmap
        mountPath: /var/run/configmaps
      - mountPath: /var/run/secrets
        secret: my-secret-file
    ```

### filesFrom[].mountPath
Type: `string`<br />
Required: `false`<br />

??? example
    ``` yaml
    spec:
      filesFrom:
      - configmap: example-files-configmap
        mountPath: /var/run/configmaps
      - mountPath: /var/run/secrets
        secret: my-secret-file
    ```

### filesFrom[].secret
Type: `string`<br />
Required: `false`<br />

??? example
    ``` yaml
    spec:
      filesFrom:
      - configmap: example-files-configmap
        mountPath: /var/run/configmaps
      - mountPath: /var/run/secrets
        secret: my-secret-file
    ```

## gcp
Type: `object`<br />
Required: `false`<br />
Availability: GCP<br />

??? example
    ``` yaml
    spec:
      gcp:
        buckets:
        - cascadingDelete: true
          lifecycleCondition:
            age: 10
            createdBefore: "2020-01-01"
            numNewerVersions: 2
            withState: ARCHIVED
          name: my-cloud-storage-bucket
          retentionPeriodDays: 30
        permissions:
        - resource:
            apiVersion: resourcemanager.cnrm.cloud.google.com/v1beta1
            kind: Project
            name: myteam-dev-ab23
          role: roles/cloudsql.client
        sqlInstances:
        - autoBackupHour: 1
          cascadingDelete: true
          collation: nb_NO.UTF8
          databases:
          - envVarPrefix: DB
            name: mydatabase
            users:
            - name: extra_user
          diskAutoresize: true
          diskSize: 30
          diskType: SSD
          highAvailability: true
          maintenance:
            day: 1
            hour: 4
          name: myinstance
          tier: db-f1-micro
          type: POSTGRES_12
    ```

### gcp.buckets
Provision cloud storage buckets and connect them to your application.

Type: `array`<br />
Required: `false`<br />

??? example
    ``` yaml
    spec:
      gcp:
        buckets:
        - cascadingDelete: true
          lifecycleCondition:
            age: 10
            createdBefore: "2020-01-01"
            numNewerVersions: 2
            withState: ARCHIVED
          name: my-cloud-storage-bucket
          retentionPeriodDays: 30
    ```

#### gcp.buckets[].cascadingDelete
Type: `boolean`<br />
Required: `false`<br />

??? example
    ``` yaml
    spec:
      gcp:
        buckets:
        - cascadingDelete: true
          lifecycleCondition:
            age: 10
            createdBefore: "2020-01-01"
            numNewerVersions: 2
            withState: ARCHIVED
          name: my-cloud-storage-bucket
          retentionPeriodDays: 30
    ```

#### gcp.buckets[].lifecycleCondition
Type: `object`<br />
Required: `false`<br />

??? example
    ``` yaml
    spec:
      gcp:
        buckets:
        - cascadingDelete: true
          lifecycleCondition:
            age: 10
            createdBefore: "2020-01-01"
            numNewerVersions: 2
            withState: ARCHIVED
          name: my-cloud-storage-bucket
          retentionPeriodDays: 30
    ```

##### gcp.buckets[].lifecycleCondition.age
Type: `integer`<br />
Required: `false`<br />

??? example
    ``` yaml
    spec:
      gcp:
        buckets:
        - cascadingDelete: true
          lifecycleCondition:
            age: 10
            createdBefore: "2020-01-01"
            numNewerVersions: 2
            withState: ARCHIVED
          name: my-cloud-storage-bucket
          retentionPeriodDays: 30
    ```

##### gcp.buckets[].lifecycleCondition.createdBefore
Type: `string`<br />
Required: `false`<br />

??? example
    ``` yaml
    spec:
      gcp:
        buckets:
        - cascadingDelete: true
          lifecycleCondition:
            age: 10
            createdBefore: "2020-01-01"
            numNewerVersions: 2
            withState: ARCHIVED
          name: my-cloud-storage-bucket
          retentionPeriodDays: 30
    ```

##### gcp.buckets[].lifecycleCondition.numNewerVersions
Type: `integer`<br />
Required: `false`<br />

??? example
    ``` yaml
    spec:
      gcp:
        buckets:
        - cascadingDelete: true
          lifecycleCondition:
            age: 10
            createdBefore: "2020-01-01"
            numNewerVersions: 2
            withState: ARCHIVED
          name: my-cloud-storage-bucket
          retentionPeriodDays: 30
    ```

##### gcp.buckets[].lifecycleCondition.withState
Type: `string`<br />
Required: `false`<br />

??? example
    ``` yaml
    spec:
      gcp:
        buckets:
        - cascadingDelete: true
          lifecycleCondition:
            age: 10
            createdBefore: "2020-01-01"
            numNewerVersions: 2
            withState: ARCHIVED
          name: my-cloud-storage-bucket
          retentionPeriodDays: 30
    ```

#### gcp.buckets[].name
Type: `string`<br />
Required: `false`<br />

??? example
    ``` yaml
    spec:
      gcp:
        buckets:
        - cascadingDelete: true
          lifecycleCondition:
            age: 10
            createdBefore: "2020-01-01"
            numNewerVersions: 2
            withState: ARCHIVED
          name: my-cloud-storage-bucket
          retentionPeriodDays: 30
    ```

#### gcp.buckets[].retentionPeriodDays
Type: `integer`<br />
Required: `false`<br />
Value range: `1`-`36500`<br />

??? example
    ``` yaml
    spec:
      gcp:
        buckets:
        - cascadingDelete: true
          lifecycleCondition:
            age: 10
            createdBefore: "2020-01-01"
            numNewerVersions: 2
            withState: ARCHIVED
          name: my-cloud-storage-bucket
          retentionPeriodDays: 30
    ```

### gcp.permissions
List of _additional_ permissions that should be granted to your application for accessing external GCP resources that have not been provisioned through NAIS. [Supported resources found here](https://cloud.google.com/config-connector/docs/reference/resource-docs/iam/iampolicymember#external_organization_level_policy_member).

Type: `array`<br />
Required: `false`<br />

??? example
    ``` yaml
    spec:
      gcp:
        permissions:
        - resource:
            apiVersion: resourcemanager.cnrm.cloud.google.com/v1beta1
            kind: Project
            name: myteam-dev-ab23
          role: roles/cloudsql.client
    ```

#### gcp.permissions[].resource
Type: `object`<br />
Required: `false`<br />

??? example
    ``` yaml
    spec:
      gcp:
        permissions:
        - resource:
            apiVersion: resourcemanager.cnrm.cloud.google.com/v1beta1
            kind: Project
            name: myteam-dev-ab23
          role: roles/cloudsql.client
    ```

##### gcp.permissions[].resource.apiVersion
Type: `string`<br />
Required: `true`<br />

??? example
    ``` yaml
    spec:
      gcp:
        permissions:
        - resource:
            apiVersion: resourcemanager.cnrm.cloud.google.com/v1beta1
            kind: Project
            name: myteam-dev-ab23
          role: roles/cloudsql.client
    ```

##### gcp.permissions[].resource.kind
Type: `string`<br />
Required: `true`<br />

??? example
    ``` yaml
    spec:
      gcp:
        permissions:
        - resource:
            apiVersion: resourcemanager.cnrm.cloud.google.com/v1beta1
            kind: Project
            name: myteam-dev-ab23
          role: roles/cloudsql.client
    ```

##### gcp.permissions[].resource.name
Type: `string`<br />
Required: `false`<br />

??? example
    ``` yaml
    spec:
      gcp:
        permissions:
        - resource:
            apiVersion: resourcemanager.cnrm.cloud.google.com/v1beta1
            kind: Project
            name: myteam-dev-ab23
          role: roles/cloudsql.client
    ```

#### gcp.permissions[].role
Type: `string`<br />
Required: `false`<br />

??? example
    ``` yaml
    spec:
      gcp:
        permissions:
        - resource:
            apiVersion: resourcemanager.cnrm.cloud.google.com/v1beta1
            kind: Project
            name: myteam-dev-ab23
          role: roles/cloudsql.client
    ```

### gcp.sqlInstances
Provision database instances and connect them to your application. See [PostgreSQL documentation](https://doc.nais.io/persistence/postgres/) for more details.

Type: `array`<br />
Required: `false`<br />

??? example
    ``` yaml
    spec:
      gcp:
        sqlInstances:
        - autoBackupHour: 1
          cascadingDelete: true
          collation: nb_NO.UTF8
          databases:
          - envVarPrefix: DB
            name: mydatabase
            users:
            - name: extra_user
          diskAutoresize: true
          diskSize: 30
          diskType: SSD
          highAvailability: true
          maintenance:
            day: 1
            hour: 4
          name: myinstance
          tier: db-f1-micro
          type: POSTGRES_12
    ```

#### gcp.sqlInstances[].autoBackupHour
If specified, run automatic backups of the SQL database at the given hour. Note that this will backup the whole SQL instance, and not separate databases. Restores are done using the Google Cloud Console.

Type: `integer`<br />
Required: `false`<br />
Value range: `0`-`23`<br />

??? example
    ``` yaml
    spec:
      gcp:
        sqlInstances:
        - autoBackupHour: 1
          cascadingDelete: true
          collation: nb_NO.UTF8
          databases:
          - envVarPrefix: DB
            name: mydatabase
            users:
            - name: extra_user
          diskAutoresize: true
          diskSize: 30
          diskType: SSD
          highAvailability: true
          maintenance:
            day: 1
            hour: 4
          name: myinstance
          tier: db-f1-micro
          type: POSTGRES_12
    ```

#### gcp.sqlInstances[].cascadingDelete
Type: `boolean`<br />
Required: `false`<br />

??? example
    ``` yaml
    spec:
      gcp:
        sqlInstances:
        - autoBackupHour: 1
          cascadingDelete: true
          collation: nb_NO.UTF8
          databases:
          - envVarPrefix: DB
            name: mydatabase
            users:
            - name: extra_user
          diskAutoresize: true
          diskSize: 30
          diskType: SSD
          highAvailability: true
          maintenance:
            day: 1
            hour: 4
          name: myinstance
          tier: db-f1-micro
          type: POSTGRES_12
    ```

#### gcp.sqlInstances[].collation
Type: `string`<br />
Required: `false`<br />

??? example
    ``` yaml
    spec:
      gcp:
        sqlInstances:
        - autoBackupHour: 1
          cascadingDelete: true
          collation: nb_NO.UTF8
          databases:
          - envVarPrefix: DB
            name: mydatabase
            users:
            - name: extra_user
          diskAutoresize: true
          diskSize: 30
          diskType: SSD
          highAvailability: true
          maintenance:
            day: 1
            hour: 4
          name: myinstance
          tier: db-f1-micro
          type: POSTGRES_12
    ```

#### gcp.sqlInstances[].databases
Type: `array`<br />
Required: `false`<br />

??? example
    ``` yaml
    spec:
      gcp:
        sqlInstances:
        - autoBackupHour: 1
          cascadingDelete: true
          collation: nb_NO.UTF8
          databases:
          - envVarPrefix: DB
            name: mydatabase
            users:
            - name: extra_user
          diskAutoresize: true
          diskSize: 30
          diskType: SSD
          highAvailability: true
          maintenance:
            day: 1
            hour: 4
          name: myinstance
          tier: db-f1-micro
          type: POSTGRES_12
    ```

##### gcp.sqlInstances[].databases[].envVarPrefix
Type: `string`<br />
Required: `false`<br />

??? example
    ``` yaml
    spec:
      gcp:
        sqlInstances:
        - autoBackupHour: 1
          cascadingDelete: true
          collation: nb_NO.UTF8
          databases:
          - envVarPrefix: DB
            name: mydatabase
            users:
            - name: extra_user
          diskAutoresize: true
          diskSize: 30
          diskType: SSD
          highAvailability: true
          maintenance:
            day: 1
            hour: 4
          name: myinstance
          tier: db-f1-micro
          type: POSTGRES_12
    ```

##### gcp.sqlInstances[].databases[].name
Type: `string`<br />
Required: `false`<br />

??? example
    ``` yaml
    spec:
      gcp:
        sqlInstances:
        - autoBackupHour: 1
          cascadingDelete: true
          collation: nb_NO.UTF8
          databases:
          - envVarPrefix: DB
            name: mydatabase
            users:
            - name: extra_user
          diskAutoresize: true
          diskSize: 30
          diskType: SSD
          highAvailability: true
          maintenance:
            day: 1
            hour: 4
          name: myinstance
          tier: db-f1-micro
          type: POSTGRES_12
    ```

##### gcp.sqlInstances[].databases[].users
Type: `array`<br />
Required: `false`<br />

??? example
    ``` yaml
    spec:
      gcp:
        sqlInstances:
        - autoBackupHour: 1
          cascadingDelete: true
          collation: nb_NO.UTF8
          databases:
          - envVarPrefix: DB
            name: mydatabase
            users:
            - name: extra_user
          diskAutoresize: true
          diskSize: 30
          diskType: SSD
          highAvailability: true
          maintenance:
            day: 1
            hour: 4
          name: myinstance
          tier: db-f1-micro
          type: POSTGRES_12
    ```

###### gcp.sqlInstances[].databases[].users[].name
Type: `string`<br />
Required: `false`<br />
Pattern: `^[_a-zA-Z][_a-zA-Z0-9]+$`<br />

??? example
    ``` yaml
    spec:
      gcp:
        sqlInstances:
        - autoBackupHour: 1
          cascadingDelete: true
          collation: nb_NO.UTF8
          databases:
          - envVarPrefix: DB
            name: mydatabase
            users:
            - name: extra_user
          diskAutoresize: true
          diskSize: 30
          diskType: SSD
          highAvailability: true
          maintenance:
            day: 1
            hour: 4
          name: myinstance
          tier: db-f1-micro
          type: POSTGRES_12
    ```

#### gcp.sqlInstances[].diskAutoresize
Type: `boolean`<br />
Required: `false`<br />

??? example
    ``` yaml
    spec:
      gcp:
        sqlInstances:
        - autoBackupHour: 1
          cascadingDelete: true
          collation: nb_NO.UTF8
          databases:
          - envVarPrefix: DB
            name: mydatabase
            users:
            - name: extra_user
          diskAutoresize: true
          diskSize: 30
          diskType: SSD
          highAvailability: true
          maintenance:
            day: 1
            hour: 4
          name: myinstance
          tier: db-f1-micro
          type: POSTGRES_12
    ```

#### gcp.sqlInstances[].diskSize
How much hard drive space to allocate for the SQL server, in gigabytes.

Type: `integer`<br />
Required: `false`<br />
Minimum value: `10`<br />

??? example
    ``` yaml
    spec:
      gcp:
        sqlInstances:
        - autoBackupHour: 1
          cascadingDelete: true
          collation: nb_NO.UTF8
          databases:
          - envVarPrefix: DB
            name: mydatabase
            users:
            - name: extra_user
          diskAutoresize: true
          diskSize: 30
          diskType: SSD
          highAvailability: true
          maintenance:
            day: 1
            hour: 4
          name: myinstance
          tier: db-f1-micro
          type: POSTGRES_12
    ```

#### gcp.sqlInstances[].diskType
Type: `enum`<br />
Required: `false`<br />
Allowed values: `HDD`, `SSD`<br />

??? example
    ``` yaml
    spec:
      gcp:
        sqlInstances:
        - autoBackupHour: 1
          cascadingDelete: true
          collation: nb_NO.UTF8
          databases:
          - envVarPrefix: DB
            name: mydatabase
            users:
            - name: extra_user
          diskAutoresize: true
          diskSize: 30
          diskType: SSD
          highAvailability: true
          maintenance:
            day: 1
            hour: 4
          name: myinstance
          tier: db-f1-micro
          type: POSTGRES_12
    ```

#### gcp.sqlInstances[].highAvailability
Type: `boolean`<br />
Required: `false`<br />

??? example
    ``` yaml
    spec:
      gcp:
        sqlInstances:
        - autoBackupHour: 1
          cascadingDelete: true
          collation: nb_NO.UTF8
          databases:
          - envVarPrefix: DB
            name: mydatabase
            users:
            - name: extra_user
          diskAutoresize: true
          diskSize: 30
          diskType: SSD
          highAvailability: true
          maintenance:
            day: 1
            hour: 4
          name: myinstance
          tier: db-f1-micro
          type: POSTGRES_12
    ```

#### gcp.sqlInstances[].maintenance
Type: `object`<br />
Required: `false`<br />

??? example
    ``` yaml
    spec:
      gcp:
        sqlInstances:
        - autoBackupHour: 1
          cascadingDelete: true
          collation: nb_NO.UTF8
          databases:
          - envVarPrefix: DB
            name: mydatabase
            users:
            - name: extra_user
          diskAutoresize: true
          diskSize: 30
          diskType: SSD
          highAvailability: true
          maintenance:
            day: 1
            hour: 4
          name: myinstance
          tier: db-f1-micro
          type: POSTGRES_12
    ```

##### gcp.sqlInstances[].maintenance.day
Type: `integer`<br />
Required: `false`<br />
Value range: `1`-`7`<br />

??? example
    ``` yaml
    spec:
      gcp:
        sqlInstances:
        - autoBackupHour: 1
          cascadingDelete: true
          collation: nb_NO.UTF8
          databases:
          - envVarPrefix: DB
            name: mydatabase
            users:
            - name: extra_user
          diskAutoresize: true
          diskSize: 30
          diskType: SSD
          highAvailability: true
          maintenance:
            day: 1
            hour: 4
          name: myinstance
          tier: db-f1-micro
          type: POSTGRES_12
    ```

##### gcp.sqlInstances[].maintenance.hour
Type: `integer`<br />
Required: `false`<br />
Value range: `0`-`23`<br />

??? example
    ``` yaml
    spec:
      gcp:
        sqlInstances:
        - autoBackupHour: 1
          cascadingDelete: true
          collation: nb_NO.UTF8
          databases:
          - envVarPrefix: DB
            name: mydatabase
            users:
            - name: extra_user
          diskAutoresize: true
          diskSize: 30
          diskType: SSD
          highAvailability: true
          maintenance:
            day: 1
            hour: 4
          name: myinstance
          tier: db-f1-micro
          type: POSTGRES_12
    ```

#### gcp.sqlInstances[].name
Type: `string`<br />
Required: `false`<br />

??? example
    ``` yaml
    spec:
      gcp:
        sqlInstances:
        - autoBackupHour: 1
          cascadingDelete: true
          collation: nb_NO.UTF8
          databases:
          - envVarPrefix: DB
            name: mydatabase
            users:
            - name: extra_user
          diskAutoresize: true
          diskSize: 30
          diskType: SSD
          highAvailability: true
          maintenance:
            day: 1
            hour: 4
          name: myinstance
          tier: db-f1-micro
          type: POSTGRES_12
    ```

#### gcp.sqlInstances[].tier
Server tier, i.e. how much CPU and memory allocated. Available tiers can be retrieved on the command line by running `gcloud sql tiers list`.

Type: `string`<br />
Required: `false`<br />
Pattern: `db-.+`<br />

??? example
    ``` yaml
    spec:
      gcp:
        sqlInstances:
        - autoBackupHour: 1
          cascadingDelete: true
          collation: nb_NO.UTF8
          databases:
          - envVarPrefix: DB
            name: mydatabase
            users:
            - name: extra_user
          diskAutoresize: true
          diskSize: 30
          diskType: SSD
          highAvailability: true
          maintenance:
            day: 1
            hour: 4
          name: myinstance
          tier: db-f1-micro
          type: POSTGRES_12
    ```

#### gcp.sqlInstances[].type
Type: `enum`<br />
Required: `false`<br />
Allowed values: `POSTGRES_11`, `POSTGRES_12`<br />

??? example
    ``` yaml
    spec:
      gcp:
        sqlInstances:
        - autoBackupHour: 1
          cascadingDelete: true
          collation: nb_NO.UTF8
          databases:
          - envVarPrefix: DB
            name: mydatabase
            users:
            - name: extra_user
          diskAutoresize: true
          diskSize: 30
          diskType: SSD
          highAvailability: true
          maintenance:
            day: 1
            hour: 4
          name: myinstance
          tier: db-f1-micro
          type: POSTGRES_12
    ```

## idporten
Configures an ID-porten client for this application. See [ID-porten](https://doc.nais.io/security/auth/idporten/) for more details.

Type: `object`<br />
Required: `false`<br />

??? example
    ``` yaml
    spec:
      idporten:
        accessTokenLifetime: 3600
        clientURI: https://www.nav.no
        enabled: true
        frontchannelLogoutPath: /oauth2/logout
        frontchannelLogoutURI: https://myapplication.nav.no/oauth2/logout
        postLogoutRedirectURIs:
        - https://www.nav.no
        redirectPath: /oauth2/callback
        redirectURI: https://myapplication.nav.no/oauth2/callback
        sessionLifetime: 7200
    ```

### idporten.accessTokenLifetime
Type: `integer`<br />
Required: `false`<br />
Value range: `1`-`3600`<br />

??? example
    ``` yaml
    spec:
      idporten:
        accessTokenLifetime: 3600
    ```

### idporten.clientURI
Type: `string`<br />
Required: `false`<br />

??? example
    ``` yaml
    spec:
      idporten:
        clientURI: https://www.nav.no
    ```

### idporten.enabled
Type: `boolean`<br />
Required: `true`<br />

??? example
    ``` yaml
    spec:
      idporten:
        enabled: true
    ```

### idporten.frontchannelLogoutPath
Type: `string`<br />
Required: `false`<br />
Pattern: `^\/.*$`<br />

??? example
    ``` yaml
    spec:
      idporten:
        frontchannelLogoutPath: /oauth2/logout
    ```

### idporten.frontchannelLogoutURI
Type: `string`<br />
Required: `false`<br />

??? example
    ``` yaml
    spec:
      idporten:
        frontchannelLogoutURI: https://myapplication.nav.no/oauth2/logout
    ```

### idporten.postLogoutRedirectURIs
Type: `array`<br />
Required: `false`<br />

??? example
    ``` yaml
    spec:
      idporten:
        postLogoutRedirectURIs:
        - https://www.nav.no
    ```

### idporten.redirectPath
Type: `string`<br />
Required: `false`<br />
Pattern: `^\/.*$`<br />

??? example
    ``` yaml
    spec:
      idporten:
        redirectPath: /oauth2/callback
    ```

### idporten.redirectURI
Type: `string`<br />
Required: `false`<br />
Pattern: `^https:\/\/.+$`<br />

??? example
    ``` yaml
    spec:
      idporten:
        redirectURI: https://myapplication.nav.no/oauth2/callback
    ```

### idporten.sessionLifetime
Type: `integer`<br />
Required: `false`<br />
Value range: `3600`-`7200`<br />

??? example
    ``` yaml
    spec:
      idporten:
        sessionLifetime: 7200
    ```

## image
Your application's Docker image location and tag.

Type: `string`<br />
Required: `true`<br />

??? example
    ``` yaml
    spec:
      image: navikt/testapp:69.0.0
    ```

## ingresses
List of URLs that will route HTTPS traffic to the application. All URLs must start with `https://`. Domain availability differs according to which environment your application is running in.

Relevant information:

* [https://doc.nais.io/clusters/gcp/](https://doc.nais.io/clusters/gcp/)
* [https://doc.nais.io/clusters/on-premises/](https://doc.nais.io/clusters/on-premises/)

Type: `array`<br />
Required: `false`<br />

??? example
    ``` yaml
    spec:
      ingresses:
      - https://myapplication.nav.no
    ```

## kafka
Enable Aiven Kafka for your application.

Type: `object`<br />
Required: `false`<br />

??? example
    ``` yaml
    spec:
      kafka:
        pool: nav-dev
    ```

### kafka.pool
Configures your application to access an Aiven Kafka cluster.

Relevant information:

* [https://doc.nais.io/addons/kafka/](https://doc.nais.io/addons/kafka/)

Type: `enum`<br />
Required: `true`<br />
Allowed values: `nav-dev`, `nav-infrastructure`, `nav-prod`<br />

??? example
    ``` yaml
    spec:
      kafka:
        pool: nav-dev
    ```

## leaderElection
If true, an HTTP endpoint will be available at `$ELECTOR_PATH` that returns the current leader.

Relevant information:

* [https://doc.nais.io/addons/leader-election/](https://doc.nais.io/addons/leader-election/)

Type: `boolean`<br />
Required: `false`<br />

??? example
    ``` yaml
    spec:
      leaderElection: true
    ```

## liveness
Many applications running for long periods of time eventually transition to broken states, and cannot recover except by being restarted. Kubernetes provides liveness probes to detect and remedy such situations. Read more about this over at the [Kubernetes probes documentation](https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/).

Type: `object`<br />
Required: `false`<br />

??? example
    ``` yaml
    spec:
      liveness:
        failureThreshold: 10
        initialDelay: 20
        path: /isalive
        periodSeconds: 5
        port: 8080
        timeout: 1
    ```

### liveness.failureThreshold
When a Pod starts, and the probe fails, Kubernetes will try _failureThreshold_ times before giving up. Giving up in case of a startup probe means restarting the Pod.

Type: `integer`<br />
Required: `false`<br />
Default value: `3`<br />

??? example
    ``` yaml
    spec:
      liveness:
        failureThreshold: 10
    ```

### liveness.initialDelay
Number of seconds after the container has started before startup probes are initiated.

Type: `integer`<br />
Required: `false`<br />

??? example
    ``` yaml
    spec:
      liveness:
        initialDelay: 20
    ```

### liveness.path
HTTP endpoint path that signals 200 OK if the application has started successfully.

Type: `string`<br />
Required: `true`<br />

??? example
    ``` yaml
    spec:
      liveness:
        path: /isalive
    ```

### liveness.periodSeconds
How often (in seconds) to perform the probe.

Type: `integer`<br />
Required: `false`<br />
Default value: `10`<br />

??? example
    ``` yaml
    spec:
      liveness:
        periodSeconds: 5
    ```

### liveness.port
Port for the startup probe.

Type: `integer`<br />
Required: `false`<br />

??? example
    ``` yaml
    spec:
      liveness:
        port: 8080
    ```

### liveness.timeout
Number of seconds after which the probe times out.

Type: `integer`<br />
Required: `false`<br />
Default value: `1`<br />

??? example
    ``` yaml
    spec:
      liveness:
        timeout: 1
    ```

## logformat
Format of the logs from the container. Use this if the container doesn't support JSON logging and the log is in a special format that need to be parsed.

Type: `enum`<br />
Required: `false`<br />
Allowed values: _(empty string)_, `accesslog`, `accesslog_with_processing_time`, `accesslog_with_referer_useragent`, `capnslog`, `glog`, `gokit`, `influxdb`, `log15`, `logrus`, `redis`, `simple`<br />

??? example
    ``` yaml
    spec:
      logformat: accesslog_with_referer_useragent
    ```

## logtransform
Extra filters for modifying log content. This can e.g. be used for setting loglevel based on http status code.

Type: `enum`<br />
Required: `false`<br />
Allowed values: `dns_loglevel`, `http_loglevel`<br />

??? example
    ``` yaml
    spec:
      logtransform: http_loglevel
    ```

## maskinporten
Configures a Maskinporten client for this application. See [Maskinporten](https://doc.nais.io/security/auth/maskinporten/) for more details.

Type: `object`<br />
Required: `false`<br />

??? example
    ``` yaml
    spec:
      maskinporten:
        enabled: true
        scopes:
        - name: some_scope
    ```

### maskinporten.enabled
Type: `boolean`<br />
Required: `true`<br />

??? example
    ``` yaml
    spec:
      maskinporten:
        enabled: true
    ```

### maskinporten.scopes
Type: `array`<br />
Required: `false`<br />

??? example
    ``` yaml
    spec:
      maskinporten:
        scopes:
        - name: some_scope
    ```

#### maskinporten.scopes[].name
Type: `string`<br />
Required: `false`<br />

??? example
    ``` yaml
    spec:
      maskinporten:
        scopes:
        - name: some_scope
    ```

## port
The port number which is exposed by the container and should receive traffic.

Type: `integer`<br />
Required: `false`<br />
Default value: `8080`<br />

??? example
    ``` yaml
    spec:
      port: 8080
    ```

## preStopHookPath
A HTTP GET will be issued to this endpoint at least once before the pod is terminated.

Relevant information:

* [https://doc.nais.io/nais-application/#handles-termination-gracefully](https://doc.nais.io/nais-application/#handles-termination-gracefully)

Type: `string`<br />
Required: `false`<br />

??? example
    ``` yaml
    spec:
      preStopHookPath: /internal/stop
    ```

## prometheus
Prometheus is used to [scrape metrics from the pod](https://doc.nais.io/observability/metrics/).

Type: `object`<br />
Required: `false`<br />

??? example
    ``` yaml
    spec:
      prometheus:
        enabled: true
        path: /metrics
        port: "8080"
    ```

### prometheus.enabled
Type: `boolean`<br />
Required: `false`<br />

??? example
    ``` yaml
    spec:
      prometheus:
        enabled: true
    ```

### prometheus.path
Type: `string`<br />
Required: `false`<br />
Default value: `/metrics`<br />

??? example
    ``` yaml
    spec:
      prometheus:
        path: /metrics
    ```

### prometheus.port
Type: `string`<br />
Required: `false`<br />

??? example
    ``` yaml
    spec:
      prometheus:
        port: "8080"
    ```

## readiness
Sometimes, applications are temporarily unable to serve traffic. For example, an application might need to load large data or configuration files during startup, or depend on external services after startup. In such cases, you don't want to kill the application, but you don’t want to send it requests either. Kubernetes provides readiness probes to detect and mitigate these situations. A pod with containers reporting that they are not ready does not receive traffic through Kubernetes Services. Read more about this over at the [Kubernetes readiness documentation](https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/).

Type: `object`<br />
Required: `false`<br />

??? example
    ``` yaml
    spec:
      readiness:
        failureThreshold: 10
        initialDelay: 20
        path: /isready
        periodSeconds: 5
        port: 8080
        timeout: 1
    ```

### readiness.failureThreshold
When a Pod starts, and the probe fails, Kubernetes will try _failureThreshold_ times before giving up. Giving up in case of a startup probe means restarting the Pod.

Type: `integer`<br />
Required: `false`<br />

??? example
    ``` yaml
    spec:
      readiness:
        failureThreshold: 10
    ```

### readiness.initialDelay
Number of seconds after the container has started before startup probes are initiated.

Type: `integer`<br />
Required: `false`<br />

??? example
    ``` yaml
    spec:
      readiness:
        initialDelay: 20
    ```

### readiness.path
HTTP endpoint path that signals 200 OK if the application has started successfully.

Type: `string`<br />
Required: `true`<br />

??? example
    ``` yaml
    spec:
      readiness:
        path: /isready
    ```

### readiness.periodSeconds
How often (in seconds) to perform the probe.

Type: `integer`<br />
Required: `false`<br />

??? example
    ``` yaml
    spec:
      readiness:
        periodSeconds: 5
    ```

### readiness.port
Port for the startup probe.

Type: `integer`<br />
Required: `false`<br />

??? example
    ``` yaml
    spec:
      readiness:
        port: 8080
    ```

### readiness.timeout
Number of seconds after which the probe times out.

Type: `integer`<br />
Required: `false`<br />

??? example
    ``` yaml
    spec:
      readiness:
        timeout: 1
    ```

## replicas
The numbers of pods to run in parallel.

Type: `object`<br />
Required: `false`<br />

??? example
    ``` yaml
    spec:
      replicas:
        cpuThresholdPercentage: 50
        max: 4
        min: 2
    ```

### replicas.cpuThresholdPercentage
Amount of CPU usage before the autoscaler kicks in.

Type: `integer`<br />
Required: `false`<br />
Default value: `50`<br />

??? example
    ``` yaml
    spec:
      replicas:
        cpuThresholdPercentage: 50
    ```

### replicas.max
The pod autoscaler will scale deployments on demand until this maximum has been reached.

Type: `integer`<br />
Required: `false`<br />
Default value: `4`<br />

??? example
    ``` yaml
    spec:
      replicas:
        max: 4
    ```

### replicas.min
The minimum amount of replicas acceptable for a successful deployment.

Type: `integer`<br />
Required: `false`<br />
Default value: `2`<br />

??? example
    ``` yaml
    spec:
      replicas:
        min: 2
    ```

## resources
When Containers have [resource requests](http://kubernetes.io/docs/user-guide/compute-resources/) specified, the Kubernetes scheduler can make better decisions about which nodes to place pods on.

Type: `object`<br />
Required: `false`<br />

??? example
    ``` yaml
    spec:
      resources:
        limits:
          cpu: 500m
          memory: 512Mi
        requests:
          cpu: 200m
          memory: 256Mi
    ```

### resources.limits
Type: `object`<br />
Required: `false`<br />

??? example
    ``` yaml
    spec:
      resources:
        limits:
          cpu: 500m
          memory: 512Mi
    ```

#### resources.limits.cpu
Type: `string`<br />
Required: `false`<br />
Default value: `500m`<br />
Pattern: `^\d+m?$`<br />

??? example
    ``` yaml
    spec:
      resources:
        limits:
          cpu: 500m
    ```

#### resources.limits.memory
Type: `string`<br />
Required: `false`<br />
Default value: `512Mi`<br />
Pattern: `^\d+[KMG]i$`<br />

??? example
    ``` yaml
    spec:
      resources:
        limits:
          memory: 512Mi
    ```

### resources.requests
Type: `object`<br />
Required: `false`<br />

??? example
    ``` yaml
    spec:
      resources:
        requests:
          cpu: 200m
          memory: 256Mi
    ```

#### resources.requests.cpu
Type: `string`<br />
Required: `false`<br />
Default value: `200m`<br />
Pattern: `^\d+m?$`<br />

??? example
    ``` yaml
    spec:
      resources:
        requests:
          cpu: 200m
    ```

#### resources.requests.memory
Type: `string`<br />
Required: `false`<br />
Default value: `256Mi`<br />
Pattern: `^\d+[KMG]i$`<br />

??? example
    ``` yaml
    spec:
      resources:
        requests:
          memory: 256Mi
    ```

## secureLogs
Whether or not to enable a sidecar container for secure logging.

Type: `object`<br />
Required: `false`<br />

??? example
    ``` yaml
    spec:
      secureLogs:
        enabled: true
    ```

### secureLogs.enabled
Whether to enable a sidecar container for secure logging. If enabled, a volume is mounted in the pods where secure logs can be saved.

Type: `boolean`<br />
Required: `true`<br />
Default value: `false`<br />

??? example
    ``` yaml
    spec:
      secureLogs:
        enabled: true
    ```

## service
How to connect to the default service in your application's container.

Type: `object`<br />
Required: `false`<br />

??? example
    ``` yaml
    spec:
      service:
        port: 80
        protocol: http
    ```

### service.port
Port for the default service. Default port is 80.

Type: `integer`<br />
Required: `true`<br />
Default value: `80`<br />

??? example
    ``` yaml
    spec:
      service:
        port: 80
    ```

### service.protocol
Which protocol the backend service runs on. Default is http.

Type: `enum`<br />
Required: `false`<br />
Default value: `http`<br />
Allowed values: `grpc`, `http`, `redis`, `tcp`<br />

??? example
    ``` yaml
    spec:
      service:
        protocol: http
    ```

## skipCaBundle
Whether to skip injection of certificate authority bundle or not. Defaults to false.

Type: `boolean`<br />
Required: `false`<br />

??? example
    ``` yaml
    spec:
      skipCaBundle: true
    ```

## startup
Startup probes will be available with Kubernetes 1.18 (in GCP, and 1.17 on-prem). Do not use this feature yet as it will not work. 
 Sometimes, you have to deal with legacy applications that might require an additional startup time on their first initialization. In such cases, it can be tricky to set up liveness probe parameters without compromising the fast response to deadlocks that motivated such a probe. The trick is to set up a startup probe with the same command, HTTP or TCP check, with a `failureThreshold * periodSeconds` long enough to cover the worst case startup time.

Type: `object`<br />
Required: `false`<br />

??? example
    ``` yaml
    spec:
      startup:
        failureThreshold: 10
        initialDelay: 20
        path: /started
        periodSeconds: 5
        port: 8080
        timeout: 1
    ```

### startup.failureThreshold
When a Pod starts, and the probe fails, Kubernetes will try _failureThreshold_ times before giving up. Giving up in case of a startup probe means restarting the Pod.

Type: `integer`<br />
Required: `false`<br />

??? example
    ``` yaml
    spec:
      startup:
        failureThreshold: 10
    ```

### startup.initialDelay
Number of seconds after the container has started before startup probes are initiated.

Type: `integer`<br />
Required: `false`<br />

??? example
    ``` yaml
    spec:
      startup:
        initialDelay: 20
    ```

### startup.path
HTTP endpoint path that signals 200 OK if the application has started successfully.

Type: `string`<br />
Required: `true`<br />

??? example
    ``` yaml
    spec:
      startup:
        path: /started
    ```

### startup.periodSeconds
How often (in seconds) to perform the probe.

Type: `integer`<br />
Required: `false`<br />

??? example
    ``` yaml
    spec:
      startup:
        periodSeconds: 5
    ```

### startup.port
Port for the startup probe.

Type: `integer`<br />
Required: `false`<br />

??? example
    ``` yaml
    spec:
      startup:
        port: 8080
    ```

### startup.timeout
Number of seconds after which the probe times out.

Type: `integer`<br />
Required: `false`<br />

??? example
    ``` yaml
    spec:
      startup:
        timeout: 1
    ```

## strategy
Specifies the strategy used to replace old Pods by new ones.

Type: `object`<br />
Required: `false`<br />

??? example
    ``` yaml
    spec:
      strategy:
        type: RollingUpdate
    ```

### strategy.type
Type: `enum`<br />
Required: `true`<br />
Default value: `RollingUpdate`<br />
Allowed values: `Recreate`, `RollingUpdate`<br />

??? example
    ``` yaml
    spec:
      strategy:
        type: RollingUpdate
    ```

## tokenx
OAuth2 tokens from TokenX for your application.

Type: `object`<br />
Required: `false`<br />

??? example
    ``` yaml
    spec:
      tokenx:
        enabled: true
        mountSecretsAsFilesOnly: true
    ```

### tokenx.enabled
if enabled, the application will have a jwker secret injected

Type: `boolean`<br />
Required: `true`<br />
Default value: `false`<br />

??? example
    ``` yaml
    spec:
      tokenx:
        enabled: true
    ```

### tokenx.mountSecretsAsFilesOnly
if enabled, secrets for TokenX will be mounted as files only, i.e. not as env.

Type: `boolean`<br />
Required: `false`<br />

??? example
    ``` yaml
    spec:
      tokenx:
        mountSecretsAsFilesOnly: true
    ```

## tracing
Type: `object`<br />
Required: `false`<br />

### tracing.enabled
if enabled, a rule allowing egress to app:jaeger will be appended to NetworkPolicy

Type: `boolean`<br />
Required: `true`<br />

## vault
Provides secrets management, identity-based access, and encrypting application data for auditing of secrets for applications, systems, and users.

Relevant information:

* [https://github.com/navikt/vault-iac/tree/master/doc](https://github.com/navikt/vault-iac/tree/master/doc)

Type: `object`<br />
Required: `false`<br />
Availability: on-premises<br />

??? example
    ``` yaml
    spec:
      vault:
        enabled: true
        paths:
        - format: env
          kvPath: /kv/preprod/fss/application/namespace
          mountPath: /var/run/secrets/nais.io/vault
        sidecar: true
    ```

### vault.enabled
Type: `boolean`<br />
Required: `false`<br />

??? example
    ``` yaml
    spec:
      vault:
        enabled: true
    ```

### vault.paths
Type: `array`<br />
Required: `false`<br />

??? example
    ``` yaml
    spec:
      vault:
        paths:
        - format: env
          kvPath: /kv/preprod/fss/application/namespace
          mountPath: /var/run/secrets/nais.io/vault
    ```

#### vault.paths[].format
Type: `enum`<br />
Required: `false`<br />
Allowed values: _(empty string)_, `env`, `flatten`, `json`, `properties`, `yaml`<br />

??? example
    ``` yaml
    spec:
      vault:
        paths:
        - format: env
          kvPath: /kv/preprod/fss/application/namespace
          mountPath: /var/run/secrets/nais.io/vault
    ```

#### vault.paths[].kvPath
Type: `string`<br />
Required: `false`<br />

??? example
    ``` yaml
    spec:
      vault:
        paths:
        - format: env
          kvPath: /kv/preprod/fss/application/namespace
          mountPath: /var/run/secrets/nais.io/vault
    ```

#### vault.paths[].mountPath
Type: `string`<br />
Required: `false`<br />

??? example
    ``` yaml
    spec:
      vault:
        paths:
        - format: env
          kvPath: /kv/preprod/fss/application/namespace
          mountPath: /var/run/secrets/nais.io/vault
    ```

### vault.sidecar
Type: `boolean`<br />
Required: `false`<br />

??? example
    ``` yaml
    spec:
      vault:
        sidecar: true
    ```

## webproxy
Expose web proxy configuration to the application using the `$HTTP_PROXY`, `$HTTPS_PROXY` and `$NO_PROXY` environment variables.

Type: `boolean`<br />
Required: `false`<br />
Availability: on-premises<br />

??? example
    ``` yaml
    spec:
      webproxy: true
    ```

