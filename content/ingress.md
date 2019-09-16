# Ingress

Default oppførsel for `nais.yaml` er å gi deg en ingress som kan nåes innenfra i NAV. Denne blir bygd opp med `{appnavn}.nais{cluster.domain}` \(e.g. [https://sigrun.nais.preprod.local](https://sigrun.nais.preprod.local)\).

Hvis du ikke trenger en intern ingress, enten fordi appen kun skal nåes innad i clusteret, eller har en egen ekstern ingress, så kan du legge til følgende i `nais.yaml`:

```yaml
ingress:
  enabled: false
```

## Custom ingress

Ønsker du en mer tilpasset adresse, som for eksempel skal nåes utenfra, så må dette settes opp i BigIP, og så må du lage en `loadBalancerConfig`-resurs i Fasit, og så knytte denne opp via [Fasit resources](https://github.com/nais/doc/tree/8c67c55b42d6da64d90f83effa058ac58e70d79c/documentation/contracts/fasit_resources.md).

Følgende felter blir brukt av NAIS:

```yaml
Type: LoadBalancerConfig
Alias: <navn på resursen>
Url: <adressen som er satt i BigIP>
Pool name: <ikke brukt>
Context roots: <la være blank hvis du skal treffe root i appen din>
```

