# NAISjobs

In terms of scheduled jobs/cronjobs on Kubernetes, NAISjobs is a slightly more hands-on approach compared to other
parts of NAIS.

## Team namespace

NAIS only allows jobs/cronjobs in the teams own namespace.

## Vault configuration

To be able to retrieve secrets from Vault, you need to add the following changes to your
`terraform/apps/${cluster}/${jobname}.yml` file:
```
name: ${jobname}
namespaces:
- ${teamname}
serviceaccounts:
  - default
```

## Applying a job to Kubernetes

When all the aforementioned steps have been completed, one can finally `apply` a yaml file to the cluster.

```bash
$ kubectl apply -f cronjob.yml
```

Below is an example of how such a yaml file may look.

* Note that `spec.jobTemplate.spec.template.spec.initContainers` and its children can be removed if there is no need
for Vault/secrets.
* Note that `spec.jobTemplate.spec.template.spec.imagePullSecrets` can be removed if your **not** using Github Package Registry

The variables in this cronjob example are as follows
* `${jobname}`: the name of the cronjob
* `${namespace}`: the name of the namespace, see [Separate namespace]
* `${teamname}`: the name of the team
* `${schedule}`: the job's schedule in a [cron time string format]
* `${image}`: the image used for the pods running the job
* `${vault_image}`: the [latest release] of the Vault sidecar
* `${vks_kv_path}`: is the path to the cronjob's secret in the Vault `kv` engine

cronjob.yml
```yaml
apiVersion: batch/v1beta1
kind: CronJob
metadata:
  name: ${jobname}
  namespace: ${teamname}
  labels:
    team: ${teamname}
spec:
  schedule: ${schedule}
  jobTemplate:
    spec:
      template:
        spec:
          restartPolicy: Never
          imagePullSecrets:
            - name: gpr-credentials
          containers:
          - name: ${jobname}
            image: ${image}
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
          resources:
            requests:
              memory: "128Mi"
              cpu: "250m"
            limits:
              memory: "256Mi"
              cpu: "500m"
		   initContainers:
           - name: vks-init
             args:
             - -v=10
             - -logtostderr
             - -one-shot
             - -vault=https://vault.adeo.no
             - -save-token=/var/run/secrets/nais.io/vault/vault_token
             - -cn=secret:${vks_kv_path}:dir=/var/run/secrets/nais.io/vault,fmt=flatten,retries=1
             env:
             - name: VAULT_AUTH_METHOD
               value: kubernetes
             - name: VAULT_SIDEKICK_ROLE
               value: ${teamname}
             - name: VAULT_K8S_LOGIN_PATH
               value: auth/kubernetes/prod/fss/login
             image: ${vault_image}
             imagePullPolicy: IfNotPresent
             volumeMounts:
             - mountPath: /var/run/secrets/nais.io/vault
               name: vault-volume
               subPath: vault/var/run/secrets/nais.io/vault
               readOnly: true
          serviceAccount: default
          serviceAccountName: default
          volumes:
          - configMap:
              defaultMode: 420
              name: ca-bundle-jks
            name: ca-bundle-jks
          - configMap:
              defaultMode: 420
              name: ca-bundle-pem
            name: ca-bundle-pem
          - emptyDir:
              medium: Memory
            name: vault-secrets
```

If you need to read secrets from a `service user`, add the following under `spec.initContainers.volumeMounts`
```
- mountPath: /var/run/secrets/nais.io/${srvUser}
  name: vault-volume
  subPath: vault/var/run/secrets/nais.io/${srvUser}
```

and the following under `spec.initContainers.args`
```
- -cn=secret:/serviceuser/data/prod/${srvUser}:dir=/var/run/secrets/nais.io/${srvUser},fmt=flatten,retries=1
```

[cron time string format]: https://pubs.opengroup.org/onlinepubs/9699919799/utilities/crontab.html#tag_20_25_07
[latest release]: https://github.com/navikt/vault-sidekick/releases
