# NAISjobs \(Jobs / CronJobs\)

We currently do not offer any abstractions for the [Job](https://kubernetes.io/docs/concepts/workloads/controllers/job/) or [CronJobs](https://kubernetes.io/docs/concepts/workloads/controllers/cron-jobs/) resources on Kubernetes.

Setting up a `Job` or `CronJob` on NAIS requires a more hands-on approach compared to other parts of NAIS. We'll guide you through it below.

## Team Namespaces

Jobs and CronJobs are only allowed to run in [your team's own namespace](../clusters/team-namespaces.md).

## Examples

### Variables used in the following examples

| variable | description | example |
| :--- | :--- | :--- |
| `${jobname}` | name for the job or cronjob | my-job |
| `${teamname}` | name of the team | my-team |
| `${namespace}` | name of the namespace, should match the team name | my-team |
| `${image}` | image used for the pods running the job | ghcr.io/navikt/my-app:1.0.0 |
| `${schedule}` | the job's schedule in a [cron time string format](https://pubs.opengroup.org/onlinepubs/9699919799/utilities/crontab.html#tag_20_25_07) | `"*/15 * * * *"` |
| `${secretname}` | name of the [Kubernetes Secrets](https://kubernetes.io/docs/concepts/configuration/secret/) object | my-secret |
| `${vault_image}` | the [latest release](https://hub.docker.com/r/navikt/vault-sidekick/tags) of the Vault sidecar | navikt/vault-sidekick:v0.3.10-d122b16 |
| `${envclass}` | one of `prod` or `preprod` | prod |
| `${zone}` | one of `fss` or `sbs` | fss |
| `${vault_login}` | Vault auth path from Kubernetes | auth/kubernetes/${envclass}/${zone}/login |
| `${vault_kv_path}` | the path to the secret in the Vault `kv` engine | kv/${envclass}/${zone}/my-job/my-team |

### Job

=== "Basic"
    ```yaml
    apiVersion: batch/v1
    kind: Job
    metadata:
      labels:
        team: ${teamname}
        app: ${jobname}
      name: ${jobname}
      namespace: ${teamname}
    spec:
      ttlSecondsAfterFinished: 300
      backoffLimit: 1
      template:
        metadata:
          labels:
            team: ${teamname}
            app: ${jobname}
        spec:
          imagePullSecrets:
            - name: ghcr-credentials  # If the image you're pulling comes from ghcr.io
            - name: gpr-credentials   # If the image you're pulling comes from docker.pkg.github.com (deprecated)
          serviceAccount: default
          serviceAccountName: default
          restartPolicy: Never
          containers:
            - name: ${jobname}
              image: ${image}
              resources:
                requests:
                  memory: 256Mi
                  cpu: 100m
                limits:
                  memory: 1024Mi
                  cpu: 1000m
    ```
=== "w/ Kubernetes secret"
    ```yaml
    apiVersion: batch/v1
    kind: Job
    metadata:
      labels:
        team: ${teamname}
        app: ${jobname}
      name: ${jobname}
      namespace: ${teamname}
    spec:
      ttlSecondsAfterFinished: 300
      backoffLimit: 1
      template:
        metadata:
          labels:
            team: ${teamname}
            app: ${jobname}
        spec:
          imagePullSecrets:
            - name: ghcr-credentials  # If the image you're pulling comes from ghcr.io
            - name: gpr-credentials   # If the image you're pulling comes from docker.pkg.github.com (deprecated)
          serviceAccount: default
          serviceAccountName: default
          restartPolicy: Never
          containers:
            - name: ${jobname}
              image: ${image}
              resources:
                requests:
                  memory: 256Mi
                  cpu: 100m
                limits:
                  memory: 1024Mi
                  cpu: 1000m
              envFrom:
                - secretRef:
                    name: ${secretname}
    ```
=== "w/ CA Bundles"
    ```yaml
    apiVersion: batch/v1
    kind: Job
    metadata:
      labels:
        team: ${teamname}
        app: ${jobname}
      name: ${jobname}
      namespace: ${teamname}
    spec:
      ttlSecondsAfterFinished: 300
      backoffLimit: 1
      template:
        metadata:
          labels:
            team: ${teamname}
            app: ${jobname}
        spec:
          imagePullSecrets:
            - name: ghcr-credentials  # If the image you're pulling comes from ghcr.io
            - name: gpr-credentials   # If the image you're pulling comes from docker.pkg.github.com (deprecated)
          serviceAccount: default
          serviceAccountName: default
          restartPolicy: Never
          containers:
            - name: ${jobname}
              image: ${image}
              resources:
                requests:
                  memory: 256Mi
                  cpu: 100m
                limits:
                  memory: 1024Mi
                  cpu: 1000m
              volumeMounts:
                - mountPath: /etc/ssl/certs/ca-certificates.crt
                  name: ca-bundle-pem
                  readOnly: true
                  subPath: ca-bundle.pem
                - mountPath: /etc/pki/tls/certs/ca-bundle.crt
                  name: ca-bundle-pem
                  readOnly: true
                  subPath: ca-bundle.pem
                - mountPath: /etc/ssl/ca-bundle.pem
                  name: ca-bundle-pem
                  readOnly: true
                  subPath: ca-bundle.pem
                - mountPath: /etc/pki/tls/cacert.pem
                  name: ca-bundle-pem
                  readOnly: true
                  subPath: ca-bundle.pem
                - mountPath: /etc/pki/ca-trust/extracted/pem/tls-ca-bundle.pem
                  name: ca-bundle-pem
                  readOnly: true
                  subPath: ca-bundle.pem
                - mountPath: /etc/ssl/certs/java/cacerts
                  name: ca-bundle-jks
                  readOnly: true
                  subPath: ca-bundle.jks
              env:
                - name: NAV_TRUSTSTORE_PATH
                  value: /etc/ssl/certs/java/cacerts
                - name: NAV_TRUSTSTORE_PASSWORD
                  value: changeme
          volumes:
            - configMap:
                defaultMode: 420
                name: ca-bundle-jks
              name: ca-bundle-jks
            - configMap:
                defaultMode: 420
                name: ca-bundle-pem
              name: ca-bundle-pem
    ```
=== "w/Vault integration"
    ```yaml
    apiVersion: batch/v1
    kind: Job
    metadata:
      labels:
        team: ${teamname}
        app: ${jobname}
      name: ${jobname}
      namespace: ${teamname}
    spec:
      ttlSecondsAfterFinished: 300
      backoffLimit: 1
      template:
        metadata:
          labels:
            team: ${teamname}
            app: ${jobname}
        spec:
          imagePullSecrets:
            - name: ghcr-credentials  # If the image you're pulling comes from ghcr.io
            - name: gpr-credentials   # If the image you're pulling comes from docker.pkg.github.com (deprecated)
          serviceAccount: default
          serviceAccountName: default
          restartPolicy: Never
          containers:
            - name: ${jobname}
              image: ${image}
              resources:
                requests:
                  memory: 256Mi
                  cpu: 100m
                limits:
                  memory: 1024Mi
                  cpu: 1000m
              volumeMounts:
                - mountPath: /var/run/secrets/nais.io/vault
                  name: vault-secrets
                  subPath: vault/var/run/secrets/nais.io/vault
              env:
                - name: VAULT_TOKEN_PATH
                  value: /var/run/secrets/nais.io/vault/vault_token
          initContainers:
            - name: vks-init
              image: ${vault_image}
              resources:
                requests:
                  memory: "64Mi"
                  cpu: "100m"
                limits:
                  memory: "128Mi"
                  cpu: "1000m"
              volumeMounts:
                - mountPath: /var/run/secrets/nais.io/vault
                  name: vault-secrets
                  subPath: vault/var/run/secrets/nais.io/vault
              args:
                - -v=10
                - -logtostderr
                - -vault=https://vault.adeo.no
                - -one-shot
                - -save-token=/var/run/secrets/nais.io/vault/vault_token
                - -cn=secret:${vault_kv_path}:dir=/var/run/secrets/nais.io/vault,fmt=flatten,retries=1
              env:
                - name: VAULT_AUTH_METHOD
                  value: kubernetes
                - name: VAULT_SIDEKICK_ROLE
                  value: ${jobname}
                - name: VAULT_K8S_LOGIN_PATH
                  value: ${vault_login}
          volumes:
            - name: vault-secrets
              emptyDir:
                medium: Memory
    ```
=== "w/CA Bundles and Vault"
    ```yaml
    apiVersion: batch/v1
    kind: Job
    metadata:
      labels:
        team: ${teamname}
        app: ${jobname}
      name: ${jobname}
      namespace: ${teamname}
    spec:
      ttlSecondsAfterFinished: 300
      backoffLimit: 1
      template:
        metadata:
          labels:
            team: ${teamname}
            app: ${jobname}
        spec:
          imagePullSecrets:
            - name: ghcr-credentials  # If the image you're pulling comes from ghcr.io
            - name: gpr-credentials   # If the image you're pulling comes from docker.pkg.github.com (deprecated)
          serviceAccount: default
          serviceAccountName: default
          restartPolicy: Never
          containers:
            - name: ${jobname}
              image: ${image}
              resources:
                requests:
                  memory: 256Mi
                  cpu: 100m
                limits:
                  memory: 1024Mi
                  cpu: 1000m
              volumeMounts:
                - mountPath: /etc/ssl/certs/ca-certificates.crt
                  name: ca-bundle-pem
                  readOnly: true
                  subPath: ca-bundle.pem
                - mountPath: /etc/pki/tls/certs/ca-bundle.crt
                  name: ca-bundle-pem
                  readOnly: true
                  subPath: ca-bundle.pem
                - mountPath: /etc/ssl/ca-bundle.pem
                  name: ca-bundle-pem
                  readOnly: true
                  subPath: ca-bundle.pem
                - mountPath: /etc/pki/tls/cacert.pem
                  name: ca-bundle-pem
                  readOnly: true
                  subPath: ca-bundle.pem
                - mountPath: /etc/pki/ca-trust/extracted/pem/tls-ca-bundle.pem
                  name: ca-bundle-pem
                  readOnly: true
                  subPath: ca-bundle.pem
                - mountPath: /etc/ssl/certs/java/cacerts
                  name: ca-bundle-jks
                  readOnly: true
                  subPath: ca-bundle.jks
                - mountPath: /var/run/secrets/nais.io/vault
                  name: vault-secrets
                  subPath: vault/var/run/secrets/nais.io/vault
              env:
                - name: NAV_TRUSTSTORE_PATH
                  value: /etc/ssl/certs/java/cacerts
                - name: NAV_TRUSTSTORE_PASSWORD
                  value: changeme
                - name: VAULT_TOKEN_PATH
                  value: /var/run/secrets/nais.io/vault/vault_token
          initContainers:
            - name: vks-init
              image:
              resources:
                requests:
                  memory: "64Mi"
                  cpu: "100m"
                limits:
                  memory: "128Mi"
                  cpu: "1000m"
              volumeMounts:
                - mountPath: /var/run/secrets/nais.io/vault
                  name: vault-secrets
                  subPath: vault/var/run/secrets/nais.io/vault
              args:
                - -v=10
                - -logtostderr
                - -vault=https://vault.adeo.no
                - -one-shot
                - -save-token=/var/run/secrets/nais.io/vault/vault_token
                - -cn=secret:${vault_kv_path}:dir=/var/run/secrets/nais.io/vault,fmt=flatten,retries=1
              env:
                - name: VAULT_AUTH_METHOD
                  value: kubernetes
                - name: VAULT_SIDEKICK_ROLE
                  value: ${jobname}
                - name: VAULT_K8S_LOGIN_PATH
                  value: ${vault_login}
          volumes:
            - configMap:
                defaultMode: 420
                name: ca-bundle-jks
              name: ca-bundle-jks
            - configMap:
                defaultMode: 420
                name: ca-bundle-pem
              name: ca-bundle-pem
            - name: vault-secrets
              emptyDir:
                medium: Memory
    ```

!!! info
    Note that `.spec.template.spec.imagePullSecrets` can be removed if your image is **not** hosted at Github Package Registry


### CronJob

A `CronJob` runs `Jobs` on a time-based schedule, as denoted in `.spec.schedule`.

The `.spec.jobTemplate` is the template for the job, and has exactly the same schema as the `spec` in [`Job`](naisjobs.md#job).

```yaml
apiVersion: batch/v1beta1
kind: CronJob
metadata:
  labels:
    team: ${teamname}
    app: ${jobname}
  name: ${jobname}
  namespace: ${teamname}
spec:
  schedule: ${schedule}
  jobTemplate:
    spec:
      <same as .spec from Jobs examples earlier>
```

## Certificates for accessing internal services

Reaching internal services such as Kafka requires the presence of a truststore that includes the certificates for these services.

Looking at the differences between the `Basic` and the `w/CA Bundles` [examples](naisjobs.md#examples), we spot the following:

### 1. Fetch CA Bundles

`.spec.template.spec.volumes[]`

```yaml
spec:
  template:
    spec:
      ...
      volumes:
        - configMap:
            defaultMode: 420
            name: ca-bundle-jks
          name: ca-bundle-jks
        - configMap:
            defaultMode: 420
            name: ca-bundle-pem
          name: ca-bundle-pem
```

Fetches CA bundles from `ConfigMaps` and injects it into the pod.

### 2. Mount CA bundles into application container

`.spec.template.spec.containers[0].volumeMounts[]`

```yaml
spec:
  template:
    spec:
      containers:
        - name: ${jobname}
          image: ${image}
          ...
          volumeMounts:
            - mountPath: /etc/ssl/certs/ca-certificates.crt
              name: ca-bundle-pem
              readOnly: true
              subPath: ca-bundle.pem
            - mountPath: /etc/pki/tls/certs/ca-bundle.crt
              name: ca-bundle-pem
              readOnly: true
              subPath: ca-bundle.pem
            - mountPath: /etc/ssl/ca-bundle.pem
              name: ca-bundle-pem
              readOnly: true
              subPath: ca-bundle.pem
            - mountPath: /etc/pki/tls/cacert.pem
              name: ca-bundle-pem
              readOnly: true
              subPath: ca-bundle.pem
            - mountPath: /etc/pki/ca-trust/extracted/pem/tls-ca-bundle.pem
              name: ca-bundle-pem
              readOnly: true
              subPath: ca-bundle.pem
            - mountPath: /etc/ssl/certs/java/cacerts
              name: ca-bundle-jks
              readOnly: true
              subPath: ca-bundle.jks
```

The files from step 1 found in `subPath` are mounted to the path specified in `mountPath` for the container of your application.

The example covers the common locations for these bundles for most systems.

### 3. \(optional\) Specify the location of the CA bundle

`.spec.template.spec.containers[0].env[]`

```yaml
spec:
  template:
    spec:
      containers:
        - name: ${jobname}
          image: ${image}
          env:
            - name: NAV_TRUSTSTORE_PATH
              value: /etc/ssl/certs/java/cacerts
            - name: NAV_TRUSTSTORE_PASSWORD
              value: changeme
```

Java applications using the [NAV baseimages](https://github.com/navikt/baseimages) may specify environment variables to automatically inject the bundles/truststore into the JVM.

## Kubernetes Secrets

If your job needs secrets that are not found in Vault, using the native [Kubernetes Secrets](https://kubernetes.io/docs/concepts/configuration/secret/) functionality is much simpler than utilizing Vault.

### Configuration

This assumes that you have already [created a Secret](https://kubernetes.io/docs/concepts/configuration/secret/#creating-your-own-secrets).

Looking at the differences between the `Basic` and the `w/Kubernetes Secret` [examples](naisjobs.md#examples), we spot the following:

#### 1. Secret data as container environment variables

`.spec.template.spec.containers[0].envFrom`

```yaml
spec:
  template:
    spec:
      ...
      containers:
        - name: ${jobname}
          image: ${image}
          ...
          envFrom:
            - secretRef:
                name: ${secretname}
```

`.spec.template.spec.containers[0].envFrom[]` exports all the Secrets referenced \(in `envFrom[].secretRef.name`\) as environment variables for the container.

Each key from each `Secret` becomes the environment variable name in the container.

## Vault

If your job needs to access Vault for fetching secrets or uses PostgreSQL on-premises, you'll also have to set up Vault integration for your job.

### 1. Permissions Setup

To be able to retrieve secrets from Vault, you need to add permissions for the Kubernetes service account.

Go to [Vault IaC](https://github.com/navikt/vault-iac) and add the following changes to your `terraform/teams/${teamname}/apps/${jobname}.yml` file:

```yaml
name: ${jobname}
cluster:
  ${cluster}:
    namespace:
      - ${teamname}
    serviceaccounts:
      - default
```

### 2. Configuration

Looking at the differences between the `Basic` and the `w/Vault integration` [examples](naisjobs.md#examples), we spot the following:

#### 2.1 Volume mount setup for Pod

`.spec.template.spec.volumes[]`

```yaml
spec:
  ttlSecondsAfterFinished: 300
  backoffLimit: 1
  template:
    spec:
      ...
      volumes:
        - name: vault-secrets
          emptyDir:
            medium: Memory
```

Sets up an empty in-memory volume mount for the pod. This is where the secrets will be stored in your pod. They will not be written to disk.

#### 2.2 Vault Init Container

`.spec.template.spec.initContainers[0]`

```yaml
spec:
  template:
    spec:
      ...
      initContainers:
        - name: vks-init
          image: ${image}
          ...
          volumeMounts:
            - mountPath: /var/run/secrets/nais.io/vault
              name: vault-secrets
              subPath: vault/var/run/secrets/nais.io/vault
          args:
            - -v=10
            - -logtostderr
            - -vault=https://vault.adeo.no
            - -one-shot
            - -save-token=/var/run/secrets/nais.io/vault/vault_token
            - -cn=secret:${vault_kv_path}:dir=/var/run/secrets/nais.io/vault,fmt=flatten,retries=1
          env:
            - name: VAULT_AUTH_METHOD
              value: kubernetes
            - name: VAULT_SIDEKICK_ROLE
              value: ${jobname}
            - name: VAULT_K8S_LOGIN_PATH
              value: ${vault_login}
```

This specifies a container that should start and run before your application container starts up.

In this case, the container is responsible for fetching secrets from Vault before startup, as seen in `.spec.template.spec.initContainers[0].args[]`:

```yaml
- -save-token=/var/run/secrets/nais.io/vault/vault_token
```

The above saves the Vault token to this path for later usage if desired.

```yaml
- -cn=secret:${vault_kv_path}:dir=/var/run/secrets/nais.io/vault,fmt=flatten,retries=1
```

The above reads a secret from `${vault_kv_path}` and outputs the files to the directory `/var/run/secrets/nais.io/vault/` in the volume mount.

For example:

```yaml
- -cn=secret:/kv/preprod/fss/my-app/my-team:dir=/var/run/secrets/nais.io/vault,fmt=flatten,retries=1
```

The volume for the Pod described in step 2.1 is mounted to the init container as seen in `.spec.template.spec.initContainers[0].volumeMounts[0]`:

```yaml
spec:
  template:
    spec:
      ...
      initContainers:
        - name: vks-init
          image: ${image}
          ...
          volumeMounts:
            - mountPath: /var/run/secrets/nais.io/vault
              name: vault-secrets
              subPath: vault/var/run/secrets/nais.io/vault
```

#### 2.3 Mount the Vault secret into the application container

`.spec.template.spec.containers[0]`

```yaml
spec:
  template:
    spec:
      containers:
        - name: ${jobname}
          image: ${image}
          ...
          volumeMounts:
            - mountPath: /var/run/secrets/nais.io/vault
              name: vault-secrets
              subPath: vault/var/run/secrets/nais.io/vault
```

The files from step 2.3 found in `subPath` are mounted to the path specified in `mountPath` for the container of your application.

#### 2.4 \(optional\) Vault token path as environment variable

`.spec.template.spec.containers[0].env[]`

```yaml
spec:
  template:
    spec:
      containers:
        - name: ${jobname}
          image: ${image}
          ...
          env:
            - name: VAULT_TOKEN_PATH
              value: /var/run/secrets/nais.io/vault/vault_token
```

If your application uses an environment variable to locate the Vault token path.

### 3. Fetching additional secrets from Vault

Repeat the steps below for each secret you want from Vault.

#### 3.1 Specify the paths where your secret should be mounted to

Add a new `volumeMount` entry to the list in:

* `.spec.template.initContainers[0].volumeMounts[]`
* `.spec.template.containers[0].volumeMounts[]`

```yaml
spec:
  template:
    spec:
      ...
      containers:
        - name: ${jobname}
          image: ${image}
          ...
          volumeMounts:
            - mountPath: ${mount_path}
              name: vault-secrets
              subPath: vault/${mount_path}
      initContainers:
        - name: vks-init
          image: ${image}
          ...
          volumeMounts:
            - mountPath: ${mount_path}
              name: vault-secrets
              subPath: vault/${mount_path}
```

where `${mount_path}` is the path to where the secret should be stored and accessed by your application container.

For example, if you want to fetch a `serviceuser`:

```yaml
spec:
  template:
    spec:
      ...
      containers:
        - name: ${jobname}
          image: ${image}
          ...
          volumeMounts:
            - mountPath: /var/run/secrets/nais.io/${srvUser}
              name: vault-secrets
              subPath: vault/var/run/secrets/nais.io/${srvUser}
      initContainers:
        - name: vks-init
          image: ${image}
          ...
          volumeMounts:
            - mountPath: /var/run/secrets/nais.io/${srvUser}
              name: vault-volume
              subPath: vault/var/run/secrets/nais.io/${srvUser}
```

#### 3.2 Specify where the secret is found in Vault

Now that you've specified the mount path for the secret, you'll need to specify where the secret is found in Vault, and

Add a new entry to the list of `.spec.template.initContainers[0].args`

```yaml
spec:
  template:
    spec:
      ...
      initContainers:
        - name: vks-init
          image: ${image}
          ...
          args:
            ...
            - -cn=secret:${kv_path}:dir=${mount_path},fmt=flatten,retries=1
```

where

* `${kv_path}` is the location of the Vault secret.
* `${mount_path}` is the `mountPath` that you specified in step 3.1

The default `${kv_path}` follows the form 

```
kv/${envclass}/${zone}/my-job/my-team

e.g.

kv/preprod/fss/my-job/my-team
```

See [vault-iac](https://github.com/navikt/vault-iac/blob/master/doc/getting-started.md#adding-an-application-to-your-team) for other Vault kv-paths.

For example:

```yaml
spec:
  template:
    spec:
      ...
      initContainers:
        - name: vks-init
          image: ${image}
          ...
          args:
            ...
            - -cn=secret:/serviceuser/data/prod/srv-my-app:dir=/var/run/secrets/nais.io/srv-my-app,fmt=flatten,retries=1
```

## Applying your job to Kubernetes

When all the aforementioned steps have been completed, you're finally ready to deploy your `Job` or `CronJob` to the cluster.

While you may run your job as part of a pipeline with [NAIS deploy](../deployment/README.md), sometimes you might just want to run a one-time job.

The easiest way to do so is to simply `apply` the `Job` or `CronJob` to the cluster:

```bash
$ kubectl apply -f job.yml
```

## GCP
For jobs running on GCP you need two more resources:
- network policy (think of this as your apps firewall)
- service entry (defining which http hosts to allow outbound from your job)

Note: If you need to make http requests to services in the cluster, use ingress instead of service discovery for Jobs for now. And notify the nais team that you have this use-case so we can prioritize fixing it.

### NetworkPolicy
```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  labels:
    team: ${teamname}
    app: ${jobname}
  name: ${jobname}
  namespace: ${namespace}
spec:
  egress:
  - to:
    - namespaceSelector:
        matchLabels:
          linkerd.io/is-control-plane: "true"
    - namespaceSelector: {}
      podSelector:
        matchLabels:
          k8s-app: kube-dns
    - ipBlock:
        cidr: 0.0.0.0/0
        except:
        - 10.6.0.0/15
        - 172.16.0.0/12
        - 192.168.0.0/16
  ingress:
    - from:
      - namespaceSelector:
          matchLabels:
            name: nais
        podSelector:
          matchLabels:
            app: prometheus
    - from:
      - namespaceSelector:
          matchLabels:
            linkerd.io/is-control-plane: "true"
    - from:
      - namespaceSelector:
          matchLabels:
            linkerd.io/extension: viz
        podSelector:
          matchLabels:
            component: tap
    - from:
      - namespaceSelector:
          matchLabels:
            linkerd.io/extension: viz
        podSelector:
          matchLabels:
            component: prometheus
  podSelector:
    matchLabels:
      app: ${jobname}
  policyTypes:
  - Ingress
  - Egress
```
