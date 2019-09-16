# Cronjobs/jobs på NAIS

Vi har en litt mer hands-on tilnærming når det gjelder jobs og cronjobs på Kubernetes.

Kom i gang med å følge stegene nedenfor:

## 1. Oppsett av Vault

Se på dokumentasjon om [Vault](https://github.com/navikt/vault-iac/blob/master/doc/endusers.md) hvis du har behov for secrets. Husk at det er et _eget_ namespace som cronjobs/jobs kjører i!

## 2. Eget namespace

Vi tillater kun cronjobs/jobs i egne namespaces. Derfor får ditt team et eget namespace som dere kan operere i. Hvis `jobs.yaml` ikke finnes i cluster-katalogen så må du selv opprette den. Da må du samtidig kopiere `naisjobs.yaml` fra en cluster-katalog til tilsvarende `templates/<cluster>`-katalog.

### Legg til ditt team i github.com/navikt/nais-yaml/vars/${cluster}/jobs.yaml

#### Finnes jobs.yaml?

Legg dette til i bunn av filen

```text
- name: ${namespace}
  group_name: ${teamname}
  group_id: ${ldap_group_id}
```

#### Ingen jobs.yaml?

Lag `jobs.yaml` i cluster-katalogen, og bruk dette som innhold:

```text
naisjobs:
- name: ${namespace}
  group_name: ${teamname}
  group_id: ${ldap_group_id}
```

## 3. Maskinbruker for å kunne opprette cronjobs/jobs?

Man vil kunne lage cronjobs/jobs med sin egen bruker, men trenger man en maskinbruker kan man få det fra oss/NAIS. Spør i [\#nais](https://nav-it.slack.com/messages/C5KUST8N6).

Det vi trenger å vite er `cluster` og `team`!

## 4. kubectl apply -f job.yml

Når alle de andre stegene er gjort, så kan dere bruke deres egen bruker, eller maskinbrukeren dere fikk i steg 3 til å `apply`e en yaml-fil i clusteret!

Nedenfor har dere et godt utgangspunkt for hvordan en slik yaml-fil kan se ut.

cronjob.yml/job.yml

```text
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
          containers:
          - name: ${jobname}
            image: repo.adeo.no:5443/<app-name>:<version>
            volumeMounts:
            - mountPath: /etc/ssl/certs/ca-certificates.crt
              name: ca-bundle
              subPath: ca-bundle.pem
            - mountPath: /etc/pki/tls/certs/ca-bundle.crt
              name: ca-bundle
              subPath: ca-bundle.pem
            - mountPath: /etc/ssl/ca-bundle.pem
              name: ca-bundle
              subPath: ca-bundle.pem
            - mountPath: /etc/pki/tls/cacert.pem
              name: ca-bundle
              subPath: ca-bundle.pem
            - mountPath: /etc/pki/ca-trust/extracted/pem/tls-ca-bundle.pem
              name: ca-bundle
              subPath: ca-bundle.pem
            - mountPath: /etc/ssl/certs/java/cacerts
              name: ca-bundle
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
              value: ${team_name}
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
              name: ca-bundle
            name: ca-bundle
          - emptyDir:
              medium: Memory
            name: vault-secrets
```

Man kan fjerne `spec.jobTemplate.spec.template.spec.initContainers`-innslaget hvis man ikke trenger Vault/hemmeligheter.

