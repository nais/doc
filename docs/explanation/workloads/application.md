# Application

A [NAIS application](../../reference/application-example.md) lets you run one or more instances of a container image. 

An application is defined by its [application manifest](../../reference/application-spec.md), which is a YAML file that describes how the application should be run and what resources it needs.

- autoskalering
- kontrakt mellom applikasjon og plattform
- en eller fler kjørende instanser av en container-image
- default isolert
- kan eksponere tjenester via en eller flere ruter
- hemmeligheter og konfigurasjon kan injiseres som environment-variabler
- provisionering og tilknytning av ressurser som database, storage, BigQuery, etc.
- 

An application is represented by an [application manifest](../../reference/application-spec.md).
The application manifest is the contract between the application and the platform, where you specify how the application should be run and what resources it needs.
The platform uses the manifest to provision and configure the necessary resources specified in the manifest.

