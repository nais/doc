# NAISjobs

In terms of scheduled jobs/cronjobs on Kubernetes, NAISjobs is a slightly more hands-on approach compared to other
parts of NAIS.

## Team setup

This section describes various parts which may be required for your team to create NAISjobs. Some of these steps may
already have been done for your team.

### Vault setup

Have a look at the [Vault documentation for end users] if the team has jobs which requires secrets. Regarding
*"Give a NAIS application read access to Vault secret"*, it is important to note that cronjobs run in a *separate*
namespace!

### Separate namespace

NAIS only allows cronjobs in separate namespaces. Teams get their own namespace in which their jobs can run in, this is
configured in [navikt/nais-yaml]. If `jobs.yaml` does not exist in the cluster directory, it must be created.
Additionally, `naisjobs.yaml` must be copied from a cluster directory to an equivalent `templates/${cluster}`
directory.

Also remember to add your namespace to the namespace list in each cluster, see 
https://github.com/navikt/nais-yaml/blob/master/vars/${cluster}/namespaces.yaml. This way you will have the GPR
credentials, and our NAB CaBundle available.

#### Adding a team to github.com/navikt/nais-yaml/vars/${cluster}/jobs.yaml

The variables in the examples of this section are as follows
* `${namespace}` is the name of the namespace the team wants for their cronjobs
* `${teamname}` is the name of the team
* `${ldap_group_id}` is the object ID of the team's [Azure AD group]

##### Does jobs.yaml exist?

Add your team metadata to the bottom of the file

```yaml
- name: ${namespace}
  group_name: ${teamname}
  group_id: ${ldap_group_id}
```

##### Is there no jobs.yaml file?

Create a file named `jobs.yaml` in the directory with the following content.

```yaml
naisjobs:
- name: ${namespace}
  group_name: ${teamname}
  group_id: ${ldap_group_id}
```

### Machine user

While it is possible to create cronjobs as a regular user, it is also possible to get a [machine user] created if
the team requires to communicate with NAIS outside of Azure Active Directory. Ask in [#nais][nais slack channel] on Slack to create a
machine user. Please provide `cluster` and `team`.

## Applying a job to Kubernetes

When all the aforementioned steps have been completed, one can finally `apply` a yaml file to the cluster, either
through the use of a [machine user] or as a regular user!

```bash
$ kubectl apply -f job.yml
```

Below is an example of how such a yaml file may look.

* Note that `spec.jobTemplate.spec.template.spec.initContainers` and its children can be removed if there is no need
for Vault/secrets.
* Note that `spec.jobTemplate.spec.template.spec.imagePullSecrets` can be removed if your **not** using Github Package Registry

The variables in this example are as follows
* `${jobname}`: the name of the cronjob
* `${namespace}`: the name of the namespace, see [Separate namespace]
* `${teamname}`: the name of the team
* `${schedule}`: the job's schedule in a [cron time string format]
* `${vks_auth_path}`: is the cronjob's authentication path in Vault
* `${vks_kv_path}`: is the path to the cronjob's secret in the Vault `kv` engine

job.yml
```yaml
apiVersion: batch/v1beta1
kind: CronJob
metadata:
  name: ${jobname}
  namespace: ${namespace}
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
              subPath: ca-bundle.pem
            - mountPath: /etc/pki/tls/certs/ca-bundle.crt
              name: ca-bundle-pem
              subPath: ca-bundle.pem
            - mountPath: /etc/ssl/ca-bundle.pem
              name: ca-bundle-pem
              subPath: ca-bundle.pem
            - mountPath: /etc/pki/tls/cacert.pem
              name: ca-bundle-pem
              subPath: ca-bundle.pem
            - mountPath: /etc/pki/ca-trust/extracted/pem/tls-ca-bundle.pem
              name: ca-bundle-pem
              subPath: ca-bundle.pem
            - mountPath: /etc/ssl/certs/java/cacerts
              name: ca-bundle-pem
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
          serviceAccount: podcreator
          serviceAccountName: podcreator
          volumes:
          - configMap:
              defaultMode: 420
              name: ca-bundle-pem
            name: ca-bundle-pem
          - emptyDir:
              medium: Memory
            name: vault-secrets
```

[Vault documentation for end users]: https://github.com/navikt/vault-iac/blob/master/doc/endusers.md
[navikt/nais-yaml]: https://github.com/navikt/nais-yaml/
[Azure AD group]: https://aad.portal.azure.com/#blade/Microsoft_AAD_IAM/GroupsManagementMenuBlade/AllGroups
[machine user]: ../basics/teams.md#machine-user
[nais slack channel]: https://nav-it.slack.com/messages/C5KUST8N6
[Separate namespace]: #separate-namespace
[cron time string format]: https://pubs.opengroup.org/onlinepubs/9699919799/utilities/crontab.html#tag_20_25_07
