---
description: Antivirus scanning of files and urls using ClamAV.
tags: [explanation, services]
---

# Anti-Virus Scanning

## Getting started

[ClamAV][clamav] is an open source antivirus engine for detecting trojans, viruses, malware and other malicious threats.
It is used in a variety of situations including file scanning, email scanning, web scanning and end point security.

This feature is installed on all Nais clusters.
ClamAV runs with one daemon pod and one pod running the REST api the applications use.
There is a service set up so all applications will be able to talk to the REST api using [http://clamav.nais-system/scan](http://clamav.nais-system/scan).
The REST api supports PUT or POST and can be tested using curl as well:

ClamAV has a REST API applications can use for scanning files and urls.

The REST API has one endpoint `/scan` that supports PUT or POST with form-data. It can be tested using curl as well:

```bash
# Example
curl -v -X POST -H "Content-Type: multipart/form-data" -F "file1=@/tmp/file_to_test"  http://clamav.nais-system.svc.cluster.local/scan
curl -v -X PUT --data-binary @/tmp/file_to_test  http://clamav.nais-system.svc.nais.local/scan
curl -v http://clamav.nais-system.svc.cluster.local/scan?url=url_to_file
```

See [ClamAV documentation][clamav-docs] and [ClamAV REST API][clamav-api] for more information.

[clamav]: https://www.clamav.net/
[clamav-docs]: https://docs.clamav.net/
[clamav-api]: https://github.com/navikt/muescheli

## Access Policy

When using ClamAV on GCP, remember to add an [outbound access policy](../workloads/how-to/access-policies.md):

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
          namespace: nais-system
```

## Support

If you have any questions about ClamAV please contact the Nais team on Slack, [#nais](https://nav-it.slack.com/messages/C5KUST8N6) or contact [@Sten.Ivar.Røkke](https://nav-it.slack.com/archives/D5KP2068Z) directly.

## Examples

Code example can be found here:

- [foreldrepenger-api](https://github.com/navikt/foreldrepengesoknad-api/blob/master/domene/src/main/java/no/nav/foreldrepenger/selvbetjening/vedlegg/virusscan/VirusScanConfig.java)
- [pale-2](https://github.com/navikt/pale-2/blob/main/src/main/kotlin/no/nav/syfo/client/clamav/ClamAvClient.kt)
