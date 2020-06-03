---
description: >
  Antivirus scanning of files and urls using clamAV. 
---

# clamAV

This feature is installed on dev-sbs and prod-sbs on-prem and the GCP clusters. clamAV runs in its own pod with a separate pod running the REST api applications use. There is a service set up so all applications (in clusters where clamav is installed) should be able to talk to the REST api using http://clamav.nais.svc.nais.local/scan. The REST api supports PUT or POST and can be tested using curl as well.

See [REST api docuentation] and [clamAV documentation]

If you have any questions about clamAV please contact the nais team on the [nais slack channel] or contact [@Sten.Ivar.Røkke].

# Examples

Code example can be found here:
[foreldrepenger-api]

[REST api documentation]: https://github.com/navikt/muescheli
[clamAV documentation]: https://www.clamav.net/documents/clam-antivirus-user-manual
[nais slack channel]: https://nav-it.slack.com/messages/C5KUST8N6
[@Sten.Ivar.Røkke]: https://nav-it.slack.com/archives/D5KP2068Z
[foreldrepenger-api]: https://github.com/navikt/foreldrepengesoknad-api/tree/master/src/main/java/no/nav/foreldrepenger/selvbetjening/tjeneste/virusscan
