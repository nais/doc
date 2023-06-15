## Sunset - tjenester som nais-teamet gradvis bygger ned

Dette er tjenester som naisteamet er i prosess med å avvikle.


### Kafka onprem

Kafka er i dag tilgjengelig både som en tjeneste fra Aiven som kjører i GCP og som en tjeneste vi kjører i egne datasentre.
Begge variantene av kafka kan nås fra alle nais-clustre. 

[ROS for Kafka i NAV](https://apps.powerapps.com/play/f8517640-ea01-46e2-9c09-be6b05013566?ID=252)

#### Bakgrunn for sanering

Kafka onprem driftes og vedlikeholdes av en håndfull personer, hvor ingen har Kafka som sin hovedoppgave.
Det er også identifisert flere potensielle problemer som ikke lar seg løse:

- Av lisensmessige årsaker kan vi ikke oppgradere clusteret in-place, så vi er bundet til nåværende versjon.
- Clusteret er satt opp med felles diskløsning (SAN), noe som gjør at alle nodene har et delt point-of-failure.
  Dette kan i visse feilsituasjoner øke sjansene for tap av data.
- Av historiske årsaker er clusteret "feilkonfigurert" på en måte som gjør at consumer offset topicet er veldig stort.
  Dette fører til lange recovery tider og potensiale for å miste offsets i feilsituasjoner.
- Skjer det noe med on-prem Kafka (sikkerhetshull, uforutsette feilhendelser) så har vi ikke mulighet til å oppgradere.
  - Dersom feilen er sikkerhetshull, så vil eneste løsning være å skru av clusteret umiddelbart med de tap av data det medfører.

**Bruk av Kafka onprem til operative tjenester i produksjon medfører høy risiko for både nedetid og tap av data.**

#### Plan
Løsningen på disse problemene er å migrere til et nytt cluster, og da har vi valgt å migrere til Aiven Kafka.

Aiven er en leverandør som har Kafka som hovedprodukt, det er et av de første produktene de tilbød, og de har opparbeidet seg høy kompetanse på drift og oppsett av Kafka i sky.
Aiven Kafka er derfor å regne som langt mer robust enn Kafka onprem, og blir kontinuerlig vedlikeholdt og forbedret av Aiven.
Det er enkelt for oss å oppgradere til nyere versjoner av Kafka, og vi drar nytte av alle driftsfordelene med sky.

Som følge av Aivens gode APIer er det også mulig for NAIS å integrere Kafka tettere i plattformen, og vi har flere muligheter for videreutvikling.
Kombinasjonen av Aiven Kafka og Kafkarator gjør det betydelig enklere for team å ta i bruk Aiven Kafka sammenlignet med Kafka onprem.

Fra 1. juni 2021 ble det stengt for opprettelse av nye topics i Kafka onprem. 

**Kafka onprem vil stenges ned 2. oktober 2023.**

**Alle team anbefales å migrere vekk fra onprem Kafka snarest.** 

#### Hvordan migrere vekk
[Dette er en guide for migrering fra onprem Kafka.](https://doc.nais.io/persistence/kafka/migrate_from_onprem/)

### FSS

Vi anbefaler at alle nye applikasjoner på nais deployes til GCP, og ikke til FSS.


### nais.adeo.no, dev.adeo.no, preprod.local, oera-q.local (ingresser)

- `nais.adeo.no` erstattes av `intern.nav.no`
- `dev.adeo.no` erstattes av `dev.intern.nav.no`
- `preprod.local` erstattes av `dev.intern.nav.no`

For applikasjoner på GCP er kun de nye ingressene mulig å benytte, mens for applikasjoner i FSS er begge mulig å bruke. 

Det er ingen plan om å avvikle de gamle ingressene i FSS, men vi anbefaler en gradvis migrering til de nye, og at nye applikasjoner benytter nye ingresser.
