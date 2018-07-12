# Overview

## Clusters

**Name**|**Domain**|**Purpose**|**Status**
---|---|---|---
**prod-fss**|*.nais.adeo.no|Production in FSS|<img alt="ready" src="https://img.shields.io/badge/status-ready-brightgreen.svg">
**prod-iapp**|*.nais-iapp.adeo.no|Production in iApp|<img alt="ready" src="https://img.shields.io/badge/status-ready-brightgreen.svg">
**prod-sbs**|*.nais.oera.no|Production in SBS|<img alt="building" src="https://img.shields.io/badge/status-ready-brightgreen.svg">
**preprod-fss**|*.nais.preprod.local|Non production in FSS|<img alt="ready" src="https://img.shields.io/badge/status-ready-brightgreen.svg">
**preprod-iapp**|*.nais-iapp.preprod.local|Non production in iApp|<img alt="ready" src="https://img.shields.io/badge/status-ready-brightgreen.svg">
**preprod-sbs**|*.nais.oera-q.local|Non production in SBS|<img alt="building" src="https://img.shields.io/badge/status-ready-brightgreen.svg">
**ci**|*.nais-ci.devillo.no|Continuous Integration for test purposes|<img alt="ready" src="https://img.shields.io/badge/status-ready-brightgreen.svg">
**dev**|*.nais.devillo.no|For cluster development|<img alt="ready" src="https://img.shields.io/badge/status-ready-brightgreen.svg">

## Services
**Serice**|**Url**| |
---|---|---
Deploy | `https://deploy.$domain` |i.e. https://deploy.nais.adeo.no
Logs | `https://logs.adeo.no`| 
Metrics | `https://grafana.adeo.no`|

## Kubernetes dashboard

The Nais platform comes with the default Kubernetes dashboard running in it's own namespace in each cluster. It's also running without an ingress, so you need to use `port-forward` to interact with it.

In Kubectl 1.10 and later you can run the following command:

```
kubectl port-forward deployment/kubernetes-dashboard 9090:9090 --namespace kubernetes-dashboard
```

In earlier Kubectl versions, you need to specify the pod that you are targeting with the `port-forward`:

```
DASHBOARD_POD=$(kubectl get pod --namespace kubernetes-dashboard --selector k8s-app=kubernetes-dashboard --output jsonpath='{.items[0].metadata.name}')
kubectl port-forward --namespace kubernetes-dashboard $DASHBOARD_POD 9090:9090
```
