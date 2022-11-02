---
description: Antivirus scanning of files and urls using ClamAV.
---

# Anti-virus Scanning

## ClamAV

This feature is installed on all nais clusters. clamAV runs in its own pod with a separate pod running the REST api applications use. There is a service set up so all applications will be able to talk to the REST api using [http://clamav.nais.svc.nais.local/scan](http://clamav.nais.svc.nais.local/scan) on-prem and [http://clamav.clamav.svc.cluster.local](http://clamav.clamav.svc.cluster.local) on GCP. The REST api supports PUT or POST and can be tested using curl as well:

```text
# Examples using the on-prem url
curl -v -X POST -H "Content-Type: multipart/form-data" -F "file1=@/tmp/file_to_test"  http://clamav.nais.svc.nais.local/scan
curl -v -X PUT --data-binary @/tmp/file_to_test  http://clamav.nais.svc.nais.local/scan
curl -v http://clamav.nais.svc.nais.local/scan?url=url_to_file
```

See [REST api documentation](https://github.com/navikt/muescheli) and [clamAV documentation](https://www.clamav.net/documents/clam-antivirus-user-manual)

When using ClamAV on GCP, remember to add an [outbound access policy](../nais-application/access-policy.md):

```yaml
apiVersion: "nais.io/v1alpha1"
kind: "Application"
metadata:
  name: app-a
...
spec:
  ...
  accessPolicy:
    outbound:
      rules:
        - application: clamav
          namespace: clamav
```

If you have any questions about clamAV please contact the nais team on the [nais slack channel](https://nav-it.slack.com/messages/C5KUST8N6) or contact [@Sten.Ivar.Røkke](https://nav-it.slack.com/archives/D5KP2068Z).

## Examples

Code example can be found here: [foreldrepenger-api](https://github.com/navikt/foreldrepengesoknad-api/tree/master/src/main/java/no/nav/foreldrepenger/selvbetjening/vedlegg/virusscan) [pale-2](https://github.com/navikt/pale-2/blob/master/src/main/kotlin/no/nav/syfo/client/ClamAvClient.kt)

