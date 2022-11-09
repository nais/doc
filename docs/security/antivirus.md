---
description: Antivirus scanning of files and urls using ClamAV.
---

# Anti-virus Scanning

## Getting started

[ClamAV][clamav] is an open source antivirus engine for detecting trojans, viruses, malware & other malicious threats. It is used in a variety of situations including email scanning, web scanning, and end point security. It provides a number of utilities including a flexible and scalable multi-threaded daemon, a command line scanner and an advanced tool for automatic database updates.

ClamAV has a REST API applications can use for scanning files and urls. The API is documented [here][clamav-rest-api].

| Cluster | URL                                             |
|---------|-------------------------------------------------|
| `fss`   | `http://clamav.nais-system.svc.nais.local/scan` |
| `gcp`   | `http://clamav.clamav/scan`                     |

The REST API has one endpoint `/scan` that supports PUT or POST with form-data. It can be tested using curl as well:

```bash
# Examples using the on-prem url
curl -v -X POST -H "Content-Type: multipart/form-data" -F "file1=@/tmp/file_to_test"  http://clamav.nais.svc.nais.local/scan
curl -v -X PUT --data-binary @/tmp/file_to_test  http://clamav.nais.svc.nais.local/scan
curl -v http://clamav.nais.svc.nais.local/scan?url=url_to_file
```

See [ClamAV documentation][clamav-docs] and [ClamAV REST API][clamav-api] for more information.

[clamav]: https://www.clamav.net/
[clamav-docs]: https://docs.clamav.net/
[clamav-api]: https://github.com/navikt/muescheli

## Access Policy

When using ClamAV on GCP, remember to add an [outbound access policy](../nais-application/access-policy.md):

```yaml
apiVersion: "nais.io/v1alpha1"
kind: "Application"
metadata:
  name: myapp
...
spec:
  ...
  accessPolicy:
    outbound:
      rules:
        - application: clamav
          namespace: clamav
```

## Support

If you have any questions about clamAV please contact the nais team on the [#nais slack channel](https://nav-it.slack.com/messages/C5KUST8N6) or contact [@Sten.Ivar.Røkke](https://nav-it.slack.com/archives/D5KP2068Z).

## Examples

Code example can be found here: [foreldrepenger-api](https://github.com/navikt/foreldrepengesoknad-api/tree/master/src/main/java/no/nav/foreldrepenger/selvbetjening/vedlegg/virusscan) [pale-2](https://github.com/navikt/pale-2/blob/master/src/main/kotlin/no/nav/syfo/client/ClamAvClient.kt)

