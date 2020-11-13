# AM/OpenAM

Dersom applikasjonen din trenger ForgeRock AM oppsett i SBS eller FSS, kan dette settes opp ved å kalle tjenesten Named \(NAIS Access Management Extension\).

Dersom deployregimet til ATOM benyttes kan man angi `skipOpenam` i deploy request for å slippe konfigurasjon av dette.

## Policyoppsett i SBS

Oppsett av policy og not enforced urls gjøres som tidligere på AM-serverne, dvs man benytter samme skript for oppsettet. Forskjellen er at dette kalles fra en tjeneste som heter nameD. Denne tjenesten kan kalles ved en enkel curl eller ved bruk av CLI'et som er laget for tjenesten \(se README på [https://github.com/nais/named](https://github.com/nais/named)\).

### Følgende krav må være oppfylt ved kall til nameD

* Innsendte parametere som må settes \(se eksempel nedenfor\):

| Parameter name | Description |
| :--- | :--- |
| application | applikasjonsnavn i Fasit |
| version | applikasjonens versjon som skal konfigureres |
| environment | miljønavn i Fasit |
| username | brukernavn i Fasit |
| password | passord i Fasit |

* Det sjekkes for gyldighet av `application`, `environment`, `username` og `password` mot Fasit, og `application`, og `version` mot Nexus
* Filene `app-policies.xml` og `not-enforced-urls.txt` må legges inn på Nexus på følgende sti:

  ```text
  https://repo.adeo.no/repository/raw/nais/<appnavn>/<versjon>/am/
  ```

Request sendes til tjenesten \(eksemplet gjelder for AM konfigurasjon i `t` og `q`\):

```text
curl -k -d '{"application": "<appnavn>", "version": "<versjon>", "environment": "<fasitmiljø>", "username": "<fasit brukernavn>", "password": "<fasit passord>"}' https://named.nais.oera-q.local/configure
```

NB! Ved oppsett av AM i SBS skal man bruke Named-tjenesten som ligger i SBS \(named.nais.oera-q.local eller named.nais.oera.no\)

## ISSO agent oppsett i FSS

Oppsett av ISSO agentene gjøres ved hjelp av REST api'et til AM. Konfigurasjonen vil opprette agent med navn - i AM. For å benytte denne agenten må man autentisere mot AM med bruker agentadmin og dennes passord.

### Følgende krav må være oppfylt ved kall til Named

* Innsendte parametere som må settes \(se eksempel nedenfor\):

| Parameter name | Description |
| :--- | :--- |
| application | applikasjonsnavn i Fasit |
| version | applikasjonens versjon som skal konfigureres |
| environment | miljønavn i Fasit |
| username | brukernavn i Fasit |
| password | passord i Fasit |
| contextroots | applikasjonens context som agenten skal støtte |

* Det sjekkes for gyldighet av `application`, `environment`, `username`, og `password` mot Fasit, og `application`, og `version` mot Nexus
* I motsetning til AM i SBS trengs det ingen eksterne konfigurasjonsfiler
* Et ekstra parameter kreves for oppsett av korrekte URL'er i openam agenten, nemlig `contextroots`, dette er da context-rootene som tidligere ble satt i app-config.xml for gammel plattform, men som nå sendes direkte i requesten \(disse kan det være flere av\)

Request sendes til tjenesten \(eksemplet gjelder for AM konfigurasjon i `t` og `q`\):

```text
curl -k -d '{"application": "<appnavn>", "version": "<versjon>", "environment": "<fasitmiljø>", "username": "<fasit brukernavn>", "password": "<fasit passord>", "contextroots": ["/context1", "/context2"]}' https://named.nais.preprod.local/configure
```

Retur fra denne requesten vil inneholde agentnavn i AM og hvilke URL'er som er satt opp for verifikasjon. På alle pod'er i NAIS blir det satt opp to environment variables som kan benyttes for å konstruere agentnavnet i applikasjonen, nemlig `APP_NAME` og `FASIT_ENVIRONMENT_NAME`. Resten av informasjonen som er nødvendig for å sette opp OpenID og hente tokens kan hentes fra Fasit.

NB! Ved oppsett av ISSO i FSS skal man bruke Named-tjenesten som ligger i FSS \(named.nais.preprod.local eller named.nais.adeo.no\)

## Trust Stores

For alle applikasjoner ligger vi inn sertifikatet nav\_truststore fra Fasit.

Sertifikat ligger på disk på pathen angitt av environment variabelen `NAV_TRUSTSTORE_PATH`. Passord til keystoren blir injected som environment variabel `NAV_TRUSTSTORE_PASSWORD`.

Dersom du bruker NAV sit [Java-baseimaget](https://github.com/nais/baseimages) blir keystore og passord til keystore satt automatisk for deg.

For å få dette til å virke MÅ du ha en applikasjonsinstans i Fasit. Denne truststore blir vedlikeholdt på dugnad. Bruk keytool til å liste hvilke sertifikater som som keystoren inneholder.

