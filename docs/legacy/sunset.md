## Sunset - tjenester som nais-teamet gradvis bygger ned

Dette er tjenester som ikke videreutvikles av naisteamet, og i noen tilfeller som vil bli avviklet.


### Sentralisert ABAC (Axiomatics)

I kjølvannet av at Team Integrasjon ble oppløst har drift av både den tekniske tjenesten, verktøystøtten, samt forvaltningen av policies i ABAC blitt utført av én person. ABAC er kritisk for tilgangsstyringen i mange tjenester, og inneholder i mange tilfeller domenelogikk. Dette lar seg dårlig forene med de effektene vi ønsker av distribuerte autonome team. Samtidig er policiene som ligger i ABAC implementert i et proprietært språk (Alfa) som gjør terskelen for å ta over denne logikken høyere enn man skulle ønske.

nais-teamet har tatt over ABAC-tjenesten fra Team Integrasjon, og ønsker å desentralisere denne. Det betyr i praksis at teamene som bruker ABAC må ta eierskap til både egne policies og egne instanser av ABAC (alternativt flytte logikken de har i ABAC inn i egne applikasjoner). Se forøvrig [ADR](https://github.com/navikt/pig/blob/master/sikkerhet/adr/003-no-abac.md) her.

Tilnærmingen til avvikling av sentralisert ABAC er først å flytte eksisterende implementasjon ut av stash/nexus og flytte til GitHub. Vi flytter samtidig instansen fra WebSphere til nais. Så tenker vi å splitte ABAC opp i domener, og flytte eierskapet for hver instans til domenet. Om teamene som bruker ABAC det aktuelle domenet ønsker å fortsette å bruke Axiomatics-ABAC eller ønsker å implementere logikken direkte i appene sine eller i en egen app er opp til teamene. Uansett hvilket valg de tar vil nais-teamet være tilgjengelig som støtte i overgangen.


### nais.adeo.no, dev.adeo.no, preprod.local, oera-q.local (ingresser)

- `nais.adeo.no` erstattes av `intern.nav.no`
- `dev.adeo.no` erstattes av `dev.intern.nav.no`
- `preprod.local` erstattes av `dev.intern.nav.no`

For applikasjoner på GCP er kun de nye ingressene mulig å benytte, mens for applikasjoner i FSS er begge mulig å bruke. 

Det er ingen plan om å avvikle de gamle ingressene i FSS, men vi anbefaler en gradvis migrering til de nye, og at nye applikasjoner benytter nye ingresser.


### MQ

MQ benyttes i dag kun via on-premises servere som driftes og vedlikeholdes av ATOM og Linux. 

Det er ønskelig at de applikasjonene som har mulighet heller benytter Aiven Kafka. Vi ønsker at man går vekk fra MQ fordi dette vil forenkle overgang til offentlig sky og et eventuelt bytte av leverandør der. Dette vil også forenkle oppsettet for applikasjonene og plattform.

Det er dog støtte for MQ fra nais-klusterne on-premises og i GCP, men da kun med nye MQ-servere som er satt opp med autentisering. 

*Bruk av ikke-autentisert MQ er definert som et alvorlig sikkerhetshull*. 
Vi ønsker at alle migrerer sine applikasjoner til enten autentisert MQ, eller aller helst Kafka, så fort som mulig. 
Bruk av ikke-autentisert MQ vil ikke være mulig fra nais-klusterne fra og med 01.12.2021.


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


### OpenAM (ESSO)

OpenAM ESSO (ESSO - ekstern single-sign-on) er en legacy løsning for single-sign-on (SSO) på tvers av nav.no applikasjoner basert på en reverse-proxy arkitektur. Dette innebærer at applikasjoner som benytter denne løsningen ligger bak en revers-proxy som håndhever autentisering, og applikasjoner henter ut brukerinformasjon ved å gjøre oppslag i OpenAM basert på et sesjonstoken. OpenAM integrerer med IDPorten vha SAML (som er deprekert hos IDPorten til fordel for OpenID Connect).

Det er et ønske om at applikasjoner migrerer seg helt bort fra OpenAM ESSO da dette er en løsning som stammer fra en helt annen tid og som har vært ansett som deprekert i NAV i lang tid. Den holdes i live on-prem til de siste applikasjonene er flyttet over til enten direktebasert integrasjon med IDPorten eller til loginservice (som et midlertidig steg). Ambisjonen er å skru av OpenAM ESSO til sommeren 2021 for å unngå å utløse enda et år med support fra Forgerock.


### OpenAM (ISSO)

OpenAM ISSO (intern single-sign-on) en on-prem løsning som tilbyr innlogging for NAV ansatte (f.eks saksbehandlere) ved bruk av OpenID Connect (OIDC) og on-prem AD. Applikasjoner som integrerer med OpenAM får tilbake et `id_token` som benyttes ved kall mot andre APIer. Arkitekturen ved API til API kall for denne løsningen ligner den vi har med loginservice, dvs. "one token to rule them all" - et token gir tilgang til et stort sett APIer. 

OpenAM ISSO driftes on-prem ved ATOM og har en sterk avhengighet til AD. Det ønskelig at flest mulig applikasjoner migrerer seg over til Azure AD som også tilbyr innlogging for NAV ansatte vha OIDC.  I tillegg til fordelen ved at Azure AD er managed skybasert løsning, støtter den også store deler av OAuth 2.0 spesfikasjonene som gjør at vi kan benytte oss av tokens som er spesifikt beregnet på APIet man skal kalle. 

Vi er klar over at en del APIer baserer seg på å motta tokens fra OpenAM ISSO og enda ikke støtter Azure AD som tilbyder. Det er derfor viktig at flest mulig APIer også implementerer støtte for Azure AD tokens, da applikasjoner som benytter OpenAM for innlogging ikke kan switche til Azure AD før avhengighetene deres støtter det. 


### FSS

Vi anbefaler at alle nye applikasjoner på nais deployes til GCP, og ikke til FSS.

