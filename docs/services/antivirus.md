---
description: Antivirus scanning of files and urls using ClamAV.
tags: [explanation, services]
---

# Anti-Virus Scanning

## What is ClamAV

[ClamAV][clamav] is an open source antivirus engine for detecting trojans, viruses, malware and other malicious threats.
It is used in a variety of situations including file scanning, email scanning, web scanning and end point security.

## Where is it available
This feature is installed on all nais clusters if the feature is enabled in the tenant.
ClamAV has a REST API applications in the cluster can use for scanning files and urls.

There is a service set up so all applications will be able to talk to the REST api using either 
- V1 API: http://clamav.nais-system/scan
- V2 API: http://clamav.nais-system/api/v2/scan

The service can only be used from inside the cluster and the APIs support PUT with a request body or POST with form-data.

It can be tested using curl:

```bash
# Example
curl -v -X POST -H "Content-Type: multipart/form-data" -F "file1=@/tmp/file_to_test"  http://clamav.nais-system.svc.cluster.local/scan
curl -v -X PUT --data-binary @/tmp/file_to_test  http://clamav.nais-system.svc.nais.local/scan
curl -v http://clamav.nais-system.svc.cluster.local/scan?url=url_to_file
```

### Access Policy

When using ClamAV on GCP, remember to add an [outbound access policy](../workloads/how-to/access-policies.md):

```yaml
apiVersion: "nais.io/v1alpha1"
kind: "Application"
metadata:
  name: myapp
...
spec:
  accessPolicy:
    outbound:
      rules:
        - application: clamav
          namespace: nais-system
```

## What is returned from the API

The response returns a JSON result that differs slightly based on which version of the API you're using:

| Scan outcome | V1 `/scan` | V2 `/api/v2/scan` |
|---|---|---|
| Clean file | **200**, `Result: "OK"` | **200**, `result: "OK"` |
| Virus detected | **200**, `Result: "FOUND"` | **200**, `result: "FOUND"`, with virus name |
| Connection or scan error | **500**, text error | **503**, `result: "ERROR"`, `error: "Scan failure"` |
| Daemon closes without answering | **200**, `Result: "OK"` (legacy limitation) | **503**, `result: "ERROR"`, `error: "Invalid response"` |

V2 applies a **90-second deadline per file scan**; daemon read timeouts return
**503 / Scan failure**. If any file fails, the V2 response returns **503**,
while retaining individual file results. V1 has no daemon-read deadline.

See [ClamAV documentation][clamav-docs] and [ClamAV REST API][clamav-rest] for more information.

[clamav]: https://www.clamav.net/
[clamav-docs]: https://docs.clamav.net/
[clamav-rest]: https://github.com/nais/clamav-rest

## Examples

Code examples can be found here:

- [foreldrepenger-api](https://github.com/navikt/foreldrepengesoknad-api/blob/master/domene/src/main/java/no/nav/foreldrepenger/selvbetjening/vedlegg/virusscan/VirusScanConfig.java)
- [pale-2](https://github.com/navikt/pale-2/blob/main/src/main/kotlin/no/nav/syfo/client/clamav/ClamAvClient.kt)

## Support

If you have any questions about ClamAV please contact the Nais team on Slack, [#nais](https://nav-it.slack.com/messages/C5KUST8N6).

