# Getting started with Nais


## Install the necessary tools

1. Kubectl https://kubernetes.io/docs/tasks/tools/install-kubectl/
1. Set up Kubectl. https://confluence.adeo.no/pages/viewpage.action?pageId=210440645#NavsApplikasjons-ogInfrastruktur-service(NAIS)-Utviklingsverkøty
1. Docker https://docs.docker.com/engine/installation/


##  Migrate your apps
##### We recommend using the build steps below in a build pipeline
1. Make sure your application behave according to the NAIS [contracts](/contracts)
1. Create [Docker image](https://docs.docker.com/engine/reference/builder/) containing your application
1. Push your image to the [NAIS registry](/registry) (Or any registry of your chosing if you're running NAIS outside NAV)
1. If your applications has demands outside of the [defaults](https://github.com/nais/naisd/blob/master/nais_example.yaml), specify them in a [nais.yaml](/nais.yaml) 
1. Push your [nais.yaml](/nais.yaml) to Nexus (Or any other location if you're running outside NAV)
```
# url format: repo.adeo.no/repository/raw/<org>/<appname>/<version>/nais.yaml
curl --user uploader:upl04d3r --upload-file path/to/nais.yaml https://repo.adeo.no/repository/raw/nais/nais-testapp/1/nais.yaml
```


deploy your application to the [clusters](/overview#clusters) of your chosing
```
curl -k -d '{"application": "appname", "version": "1", "environment": "t0", "zone": "fss", "namespace": "default", "username": "brukernavn", "password": "passord"}' https://daemon.nais.devillo.no/deploy
```

## If I have questions:
1. Read this document
1. Ask a question on [Slack](https://nav-it.slack.com/messages/C5KUST8N6/)
1. Visit AURA in Sannergata, 2nd floor, room 2040.

## Background material
* Kubernetes introduction: https://kubernetes.io/docs/tutorials/kubernetes-basics/
* Docker introduction:  https://docs.docker.com/engine/docker-overview/

## NAV internal experiences
* https://confluence.adeo.no/display/AURA/NAIS+erfaringer+-+migrering+av+varseloppgave
