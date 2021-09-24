## Sunset - tjenester som nais-teamet gradvis bygger ned

Dette er tjenester som ikke videreutvikles av naisteamet, og i noen tilfeller som vil bli avviklet.

### nais-sbs

nais-clustrene `dev-sbs` og `prod-sbs`, også kjent som "selvbetjeningssonen" ønsker nais-teamet å avvikle til fordel for  GCP. Grunnen til dette er at tilsvarende clustre i GCP (`dev-gcp` og `prod-gcp`) har funksjonslikhet med SBS, og vil i tillegg gi tilgang til:

- automatisk provisjonering av databaser og bøtter
- bedre sikkerhet og mer robuste mønster for app-til-app kommunikasjon
- bedre applikasjonsmetrikker, for eksempel på kall inn og ut av appen
- helautomatisert konfigurasjon når en app skal eksponeres

For brukere av nais betyr det at nye applikasjoner skal legges til GCP fremfor SBS, og at eksisterende applikasjoner i SBS må migreres til GCP. Følgende frister gjelder for migrering:
- Fredag 8. oktobe 2021 stenges muligheten for å lage nye apper i SBS-clustrene
- Fredag 1. april 2022 skal alle apper i SBS være migrert til GCP

Begge datoene gjelder for både prod-sbs og dev-sbs. Dersom deres team har en applikasjon som ikke er mulig å migrere til sky vil det være mulig å få unntak fra kravet om migrering. Slike unntak skal godkjennes av IT-direktøren, og det vil komme mer info senere om prosessen for å søke om unntak. Vi vil komme tilbake til hvilke løsninger som blir tilgjengelig onprem for disse appene som er unntatt migrering.


### Sentralisert ABAC (Axiomatics)

I kjølvannet av at Team Integrasjon ble oppløst har drift av både den tekniske tjenesten, verktøystøtten, samt forvaltningen av policies i ABAC blitt utført av én person. ABAC er kritisk for tilgangsstyringen i mange tjenester, og inneholder i mange tilfeller domenelogikk. Dette lar seg dårlig forene med de effektene vi ønsker av distribuerte autonome team. Samtidig er policiene som ligger i ABAC implementert i et proprietært språk (Alfa) som gjør terskelen for å ta over denne logikken høyere enn man skulle ønske.

nais-teamet har tatt over ABAC-tjenesten fra Team Integrasjon, og ønsker å desentralisere denne. Det betyr i praksis at teamene som bruker ABAC må ta eierskap til både egne policies og egne instanser av ABAC (alternativt flytte logikken de har i ABAC inn i egne applikasjoner). Se forøvrig [ADR](https://github.com/navikt/pig/blob/master/sikkerhet/adr/003-no-abac.md) her.

Tilnærmingen til avvikling av sentralisert ABAC er først å flytte eksisterende implementasjon ut av stash/nexus og flytte til GitHub. Vi flytter samtidig instansen fra WebSphere til nais. Så tenker vi å splitte ABAC opp i domener, og flytte eierskapet for hver instans til domenet. Om teamene som bruker ABAC det aktuelle domenet ønsker å fortsette å bruke Axiomatics-ABAC eller ønsker å implementere logikken direkte i appene sine eller i en egen app er opp til teamene. Uansett hvilket valg de tar vil nais-teamet være tilgjengelig som støtte i overgangen.



### nais.adeo.no, dev.adeo.no, preprod.local, oera-q.local (ingresser)

- `nais.adeo.no` erstattes av `intern.nav.no`
- `dev.adeo.no` erstattes av `dev.intern.nav.no`
- `preprod.local` erstattes av `dev.intern.nav.no`
- `oera-q.local` erstattes av `dev.nav.no`

For applikasjoner på GCP er kun de nye ingressene mulig å benytte, mens for applikasjoner i FSS er begge mulig å bruke. 

Det er ingen plan om å avvikle de gamle ingressene i FSS, men vi anbefaler en gradvis migrering til de nye, og at nye applikasjoner benytter nye ingresser.



### MQ

MQ benyttes i dag kun via on-premises servere som driftes og vedlikeholdes av ATOM og Linux. 

Det er ønskelig at de applikasjonene som har mulighet heller benytter Aiven Kafka. Vi ønsker at man går vekk fra MQ fordi dette vil forenkle overgang til offentlig sky og et eventuelt bytte av leverandør der. Dette vil også forenkle oppsettet for applikasjonene og plattform.

Det er dog støtte for MQ fra nais-klusterne on-premises og i GCP, men da kun med nye MQ-servere som er satt opp med autentisering. 

*Bruk av ikke-autentisert MQ er definert som et alvorlig sikkerhetshull*. 
Vi ønsker at alle migrerer sine applikasjoner til enten autentisert MQ, eller aller helst Kafka, så fort som mulig. 
Bruk av ikke-autentisert MQ vil ikke være mulig fra nais-klusterne fra og med 01.12.2021. 

### Rook/Ceph

Rook/Ceph er i dag satt opp on-premises og tilgjengelig fra alle nais-klustere der. Disse er ikke tilgjengelig fra GCP og det er heller ikke ønskelig. Løsningen driftes og vedlikeholdes av nais, men det er en stor rigg med en del vedlikeholdsarbeid. Løsningen har ingen fullverdig backup, selv om det gjøres backup av fysiske volum og noder der Rook/Ceph kjører.

Rook/Ceph ønskes sanert, vi ønsker derfor at ingen nye apper tar dette i bruk og heller benytter seg av buckets i GCP og ElasticSearch i GCP eller Aiven. Rook/ceph anses som en risiko pga utilstrekkelig backup ettersom et kluster ikke kan relokeres eller flyttes. 

Det er en uttalt plan for sanering av Rook/Ceph, men løsningen vil leve videre med vedlikehold til tilstrekkelig mange applikasjoner har flyttet sine data ut i offentlig sky.

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

Løsningen på disse problemene er å migrere til et nytt cluster, og da har vi valgt å migrere til Aiven Kafka.

Aiven er en leverandør som har Kafka som hovedprodukt, det er et av de første produktene de tilbød, og de har opparbeidet seg høy kompetanse på drift og oppsett av Kafka i sky.
Aiven Kafka er derfor å regne som langt mer robust enn Kafka onprem, og blir kontinuerlig vedlikeholdt og forbedret av Aiven.
Det er enkelt for oss å oppgradere til nyere versjoner av Kafka, og vi drar nytte av alle driftsfordelene med sky.

Som følge av Aivens gode APIer er det også mulig for NAIS å integrere Kafka tettere i plattformen, og vi har flere muligheter for videreutvikling.
Kombinasjonen av Aiven Kafka og Kafkarator gjør det betydelig enklere for team å ta i bruk Aiven Kafka sammenlignet med Kafka onprem.

Vi hadde tidligere en ambisjon om at Kafka onprem skulle skrus av før sommeren 2021, men siden vi så at enkelte team ville ha problemer med å migrere før det har vi gått vekk fra en hard deadline for dette. Vi vil likevel oppfordre alle som har mulighet til å migrere til Aiven Kafka så snart som mulig.

Vi har allikevel besluttet at vi stenger for å opprette nye topics i Kafka onprem fra 1. juni 2021. 
Hypotesen er at siden det allikevel er et nytt topic, så er det både enklere og mer fremtidsrettet om det opprettes på Aiven Kafka, og vi ønsker å redusere mengden data som går gjennom Kafka onprem.

### loginservice

Loginservice (ved bruk av Azure AD B2C) tilbyr en fellestjeneste for "delegated authentication" for alle borgerrettede apper, dvs mot ID-porten. Token fått ved innlogging via Loginservice gir tilgang til en rekke bakenforliggende tjenester, ved at dette tokenet propageres as-is.

En sentral fellestjeneste kan utgjøre en risiko, både operasjonelt og sikkerhetsmessig. Dersom Loginservice er utilgjengelig er i praksis alle innloggede tjenester på nav.no nede. Ved bruk av loginservice og propagering av `id_token` as-is så har vi i praksis  "one token to rule them all" mtp tilgang til APIer. Denne arkitekturen gjør at kompromitterte tokens har et stort skadepotensiale, og er heller ikke i tråd med "zero trust"-prinsippene vi designer systemene våre etter. 

Som med alle andre fellestjenester skapes det sterke koblinger. Endringer i tjenesten medfører et stort behov for koordinering, og dermed bremses farta til teamene. Det å holde tjenesten oppdatert er også en vedlikeholdsbyrde som stjeler tid fra andre og mere framtidsrettede aktiviteter i plattformteamet. 

Vi har et ønske om en sikkerhetsarkitektur hvor hvert enkelt token er spesifikt beregnet til det APIet som man skal kalle. Dette kan vi ikke oppnå med en fellestjeneste som Loginservice.

I GCP har teamene nå fått mulighet til å integrere direkte mot ID-porten selv, og NAV ITs strategi sier at teamene skal ta ansvar for alle aspekter ved produktene sine (også autentisering). Vi tilbyr også "TokenX" og andre mekanismer som er i tråd med "zero trust". Vi vil derfor ikke utvikle mer på Loginservice, men kun sørge for "lyset holdes på" fram til den kan skrus av.

En gulrot for teamene som integrerer seg direkte med IDPorten er at de da kan benytte seg av `refresh_tokens` for en mer sømløs og brukervennlig opplevelse for brukere på nav.no mtp utløpt token.

### OpenAM (ESSO)

OpenAM ESSO (ESSO - ekstern single-sign-on) er en legacy løsning for single-sign-on (SSO) på tvers av nav.no applikasjoner basert på en reverse-proxy arkitektur. Dette innebærer at applikasjoner som benytter denne løsningen ligger bak en revers-proxy som håndhever autentisering, og applikasjoner henter ut brukerinformasjon ved å gjøre oppslag i OpenAM basert på et sesjonstoken. OpenAM integrerer med IDPorten vha SAML (som er deprekert hos IDPorten til fordel for OpenID Connect).

Det er et ønske om at applikasjoner migrerer seg helt bort fra OpenAM ESSO da dette er en løsning som stammer fra en helt annen tid og som har vært ansett som deprekert i NAV i lang tid. Den holdes i live on-prem til de siste applikasjonene er flyttet over til enten direktebasert integrasjon med IDPorten eller til loginservice (som et midlertidig steg). Ambisjonen er å skru av OpenAM ESSO til sommeren 2021 for å unngå å utløse enda et år med support fra Forgerock.

### OpenAM (ISSO)

OpenAM ISSO (intern single-sign-on) en on-prem løsning som tilbyr innlogging for NAV ansatte (f.eks saksbehandlere) ved bruk av OpenID Connect (OIDC) og on-prem AD. Applikasjoner som integrerer med OpenAM får tilbake et `id_token` som benyttes ved kall mot andre APIer. Arkitekturen ved API til API kall for denne løsningen ligner den vi har med loginservice, dvs. "one token to rule them all" - et token gir tilgang til et stort sett APIer. 

OpenAM ISSO driftes on-prem ved ATOM og har en sterk avhengighet til AD. Det ønskelig at flest mulig applikasjoner migrerer seg over til Azure AD som også tilbyr innlogging for NAV ansatte vha OIDC.  I tillegg til fordelen ved at Azure AD er managed skybasert løsning, støtter den også store deler av OAuth 2.0 spesfikasjonene som gjør at vi kan benytte oss av tokens som er spesifikt beregnet på APIet man skal kalle. 

Vi er klar over at en del APIer baserer seg på å motta tokens fra OpenAM ISSO og enda ikke støtter Azure AD som tilbyder. Det er derfor viktig at flest mulig APIer også implementerer støtte for Azure AD tokens, da applikasjoner som benytter OpenAM for innlogging ikke kan switche til Azure AD før avhengighetene deres støtter det. 
