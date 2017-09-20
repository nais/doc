# Getting started

## Steps

##### We recommend joining the build steps below in a build pipeline
1. Make sure your application behave according to the NAIS [contracts](/contracts)
1. Create [Docker image](https://docs.docker.com/engine/reference/builder/) containing your application
1. Push your image to the [NAIS registry](/registry) (Or any registry of your chosing if you're running NAIS outside NAV)
1. If your applications has demands outside of the [defaults](/naisd#defaults), specify them in a [nais.yaml](/naisd) 
1. Push your [nais.yaml](/naisd) to Nexus (Or any other location if you're running outside NAV)
```
curl -s -F r=m2internal -F hasPom=false -F e=yaml -F g=nais -F a=${application} -F v=${releaseVersion} -F p=yaml -F file=@${appConfig} -u ${nexusUser}:${nexusPassword} http://maven.adeo.no/nexus/service/local/artifact/maven/content"
```
1. [deploy](/naisd#deploy) your application to the [clusters](/overview#clusters) of your chosing
```
curl -k -d '{"application": "appName", "version": "1"}' https://daemon.nais.devillo.no/deploy
```

1. Profit
---
## If I have questions:
1. Read this document
1. Ask a question on [Slack](https://nav-it.slack.com/messages/C5KUST8N6/)
1. Visit AURA in Sannergata, 2nd floor.

## Background material
* Kubernetes introduction: https://kubernetes.io/docs/tutorials/kubernetes-basics/
* Docker introduction:  https://docs.docker.com/engine/docker-overview/
