## Sunset - tjenester som nais-teamet gradvis bygger ned

Dette er tjenester som naisteamet er i prosess med å avvikle.

### FSS

Vi anbefaler at alle nye applikasjoner på nais deployes til GCP, og ikke til FSS.

### `nais.adeo.no`, `dev.adeo.no`, `preprod.local`, `oera-q.local` (ingresser)

- `nais.adeo.no` erstattes av `intern.nav.no`
- `dev.adeo.no` erstattes av `dev.intern.nav.no`
- `preprod.local` erstattes av `dev.intern.nav.no`

For applikasjoner på GCP er kun de nye ingressene mulig å benytte, mens for applikasjoner i FSS er begge mulig å bruke.

Det er ingen plan om å avvikle de gamle ingressene i FSS, men vi anbefaler en gradvis migrering til de nye, og at nye applikasjoner benytter nye ingresser.
