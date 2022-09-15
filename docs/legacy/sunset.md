## Sunset - tjenester som nais-teamet gradvis bygger ned

Dette er tjenester som ikke videreutvikles av naisteamet, og i noen tilfeller som vil bli avviklet.


### nais.adeo.no, dev.adeo.no, preprod.local, oera-q.local (ingresser)

- `nais.adeo.no` erstattes av `intern.nav.no`
- `dev.adeo.no` erstattes av `dev.intern.nav.no`
- `preprod.local` erstattes av `dev.intern.nav.no`

For applikasjoner på GCP er kun de nye ingressene mulig å benytte, mens for applikasjoner i FSS er begge mulig å bruke. 

Det er ingen plan om å avvikle de gamle ingressene i FSS, men vi anbefaler en gradvis migrering til de nye, og at nye applikasjoner benytter nye ingresser.


### Kafka onprem

Kafka er i dag tilgjengelig både som en tjeneste fra Aiven som kjører i GCP og som en tjeneste vi kjører i egne datasentre.
Begge variantene av kafka kan nås fra alle nais-clustre. 

Kafka onprem driftes og vedlikeholdes av en håndfull personer, hvor ingen har Kafka som sin hovedoppgave.
Det er også identifisert flere potensielle problemer som ikke lar seg løse:

- Av lisensmessige årsaker kan vi ikke oppgradere clusteret in-place, så vi er bundet til nåværende versjon.
- Clusteret er satt opp med felles diskløsning (SAN), noe som gjør at alle nodene har et delt point-of-failure.
  Dette kan i visse feilsituasjoner øke sjansene for tap av data.
- Av historiske årsaker er clusteret "feilkonfigurert" på en måte som gjør at consumer offset topicet er veldig stort.
  Dette fører til lange recovery tider og potensiale for å miste offsets i feilsituasjoner.
- Skjer det noe med on-prem Kafka (sikkerhetshull, uforutsette feilhendelser) så har vi ikke mulighet til å oppgradere.
  - Dersom feilen er sikkerhetshull, så vil eneste løsning være å skru av clusteret umiddelbart med de tap av data det medfører.

Løsningen på disse problemene er å migrere til et nytt cluster, og da har vi valgt å migrere til Aiven Kafka.

Aiven er en leverandør som har Kafka som hovedprodukt, det er et av de første produktene de tilbød, og de har opparbeidet seg høy kompetanse på drift og oppsett av Kafka i sky.
Aiven Kafka er derfor å regne som langt mer robust enn Kafka onprem, og blir kontinuerlig vedlikeholdt og forbedret av Aiven.
Det er enkelt for oss å oppgradere til nyere versjoner av Kafka, og vi drar nytte av alle driftsfordelene med sky.

Som følge av Aivens gode APIer er det også mulig for NAIS å integrere Kafka tettere i plattformen, og vi har flere muligheter for videreutvikling.
Kombinasjonen av Aiven Kafka og Kafkarator gjør det betydelig enklere for team å ta i bruk Aiven Kafka sammenlignet med Kafka onprem.

Vi hadde tidligere en ambisjon om at Kafka onprem skulle skrus av før sommeren 2021, men siden vi så at enkelte team ville ha problemer med å migrere før det har vi gått vekk fra en hard deadline for dette. Vi vil likevel oppfordre alle som har mulighet til å migrere til Aiven Kafka så snart som mulig.

Vi har allikevel besluttet at vi stenger for å opprette nye topics i Kafka onprem fra 1. juni 2021. 
Hypotesen er at siden det allikevel er et nytt topic, så er det både enklere og mer fremtidsrettet om det opprettes på Aiven Kafka, og vi ønsker å redusere mengden data som går gjennom Kafka onprem.

[ROS for Kafka i NAV](https://apps.powerapps.com/play/f8517640-ea01-46e2-9c09-be6b05013566?ID=252)


### loginservice

#### Bakgrunn for sunseting
Loginservice (ved bruk av Azure AD B2C) tilbyr en fellestjeneste for "delegated authentication" for alle borgerrettede apper, dvs mot ID-porten.
Token fått ved innlogging via Loginservice gir tilgang til en rekke bakenforliggende tjenester, ved at dette tokenet propageres as-is.

Ved bruk av loginservice og propagering av `id_token` as-is så har vi i praksis "one token to rule them all" med tanke på tilgang til APIer. 
Denne arkitekturen gjør at kompromitterte tokens har et stort skadepotensiale, og er heller ikke i tråd med "zero trust"-prinsippene vi designer systemene våre etter. 

Vi har i NAV hatt mange tjenester som løser behov knyttet til innlogging: loginservice, openAM, og nå også [wonderwall](https://doc.nais.io/appendix/wonderwall/). 
Fremover er det wonderwall vi vil drive aktiv videreutvikling på, og i tråd med ambisjonen om å redusere vårt teknologiske fotavtrykk ønsker vi derfor å sanere loginservice.


#### Plan
Loginservice blir ikke videreutviklet, men driftes as-is frem til tjenesten kan slås av.

ID-porten endrer arkitektur i 2023, og loginservice vil ikke bli oppdatert for å støtte dette. 
Det er per nå ikke satt en sunset-dato for loginservice, men det skjer sannsynligvis innen sommeren 2023.

Vi anbefaler alle team sterkt å starte migreringen vekk fra loginservice allerede nå.


#### Hvordan migrere vekk
* Hvis du har en backend som aksepterer tokens fra `loginservice` må du i stedet akseptere tokens fra TokenX
* Benytt [wonderwall](https://doc.nais.io/appendix/wonderwall/) der hvor du i dag benytter loginservice


### FSS

Vi anbefaler at alle nye applikasjoner på nais deployes til GCP, og ikke til FSS.
