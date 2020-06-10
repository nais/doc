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
* `${vks_auth_path}`: is the cronjob's authentication path in Vault
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
            image: repo.adeo.no:5443/${app-name}:${version}
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
          - env:
            - name: VKS_VAULT_ADDR
              value: https://vault.adeo.no
            - name: VKS_AUTH_PATH
              value: ${vks_auth_path}
            - name: VKS_KV_PATH
              value: ${vks_kv_path}
            - name: VKS_VAULT_ROLE
              value: ${teamname}
            - name: VKS_SECRET_DEST_PATH
              value: /var/run/secrets/nais.io/vault
            image: navikt/vks:44
            name: vks
            volumeMounts:
            - mountPath: /var/run/secrets/nais.io/vault
              name: vault-secrets
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

[cron time string format]: https://pubs.opengroup.org/onlinepubs/9699919799/utilities/crontab.html#tag_20_25_07
