# Unleash

> Unleash is a feature toggle system, that gives you a great overview of all feature toggles across all your applications and services. It comes with official client implementations for Java, Node.js, Go, Ruby, Python and .Net.

We use [Unleash](https://docs.getunleash.io/) for feature toggling in NAIS and NAV.
Get started at [unleash.nais.io](https://unleash.nais.io/), and you can look at tips for your [feature toggles available here](https://www.unleash-hosted.com/articles/what-are-the-feature-toggle-best-practices).

We've only got _one_  supported environment - but if you want to test it out you can use [(https://)unleash.dev.intern.nav.no](https://unleash.dev.intern.nav.no/).

## NAV Recommended best practices

!!! notice
    The below tips are just a simplified digest [of tips listed on their official page](https://www.unleash-hosted.com/articles/what-are-the-feature-toggle-best-practices).

Ensure that;

1. Defaults are set
2. Your app doesn't die/freak out if it doesn't reach NAV IT's unleash server
3. Feature toggles have expiration date (and are short-lived)
    - If you don't want to remove the "`if feature -> toggle`" code/functionality from the feature toggled in your application, consider adding it as an configuration setting in your [nais.yaml](../../nais-application/application#specenvfromconfigmap) instead.

## Metrics
Unleash supports metrics of usage of features.
These can either be viewed on the web page, or in [Grafana](https://grafana.adeo.no/d/vnCneDVWk/unleash?orgId=1).

## Support
Is the Unleash server down or unavailable? Ask for help in [#unleash](https://nav-it.slack.com/archives/C9BPTSULS)!

If you're wondering about best practices [#unleash](https://nav-it.slack.com/archives/C9BPTSULS) is a good place to ask where volunteers will help as best as they can!

PS: You might be able to find the answers you seek by checking out [NAV Recommended best practices](#nav-recommended-best-practices) and it's linked source!
