# Getting started

## If I have questions:
1. Read this document
1. Ask a question on Slack (https://nav-it.slack.com/messages/C5KUST8N6/)
1. Visit AURA in Sannergata, 2nd floor.

## Background material
* Kubernetes introduction: https://kubernetes.io/docs/tutorials/kubernetes-basics/
* Docker introduction:  https://docs.docker.com/engine/docker-overview/

## Migration guide
1. Make sure your application behaves according to the NAIS [contracts](/contracts)
1. Make your application run in a Docker image
1. Modify your build pipeline to push your image to the [NAIS registry](/registry)
1. If your applications has demands outside of the [defaults](/naisd#defaults), make a [nais.yaml](/naisd)
1. Modify your build pipeline to push your [nais.yaml](/naisd) 
1. Make a step in your build pipeline to [deploy](/naisd#deploy) to the clusters of your chosing
1. Profit