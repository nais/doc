---
description: >
  Volume storage is a storage solution based on kubernetes PV and PVC used for persistent storage. 
---

# Volume storage

The volume storage in NAIS is supported using the storage class rook-ceph. Rook handles the ceph cluster which in turn provides persistent voluments and persistent volume claims. This is most commonly used for elasticsearch installations and other solutions that require persistent volumes for databases. This is persistent storage and available in all clusters. The preferred solution is to use GCP for both applications and persistent volumes, but it is supported on-prem as well.

The installation is done through [navikt/nais-tpa] with [helm]. This also supports dynamic resizing of the persistent volumes.

{% hint style="tip" %}
This feature is only available in on-premises clusters.
{% endhint %}

## How to

### Installation of helm chart

On NAIS on-prem we use nais-tpa to install helm charts with the defined persistent volume claims. When the chart is installed rook will initiate the persistent volumes required by the chart. 
Contact the nais team for questions using slack channel [#nais-tpa].

Example yaml for elasticsearch install:

example-opendistro-elasticsearch.yaml
```yaml
name: example
release:
  chart: nais/opendistro-elasticsearch:0.3
configuration:
  odfe:
    image:
      repository: amazon/opendistro-for-elasticsearch
      tag: 1.0.0
      pullPolicy: IfNotPresent
    stateful:
      enabled: true
      class: "rook-ceph-block"
    serviceType: ClusterIP
    env:
      TEAM: "team"
      cluster.name: "example"
    security:
      enabled: true

  master:
    replicas: 3
    resources:
      limits:
        cpu: 2
        memory: 2048Mi
      requests:
        cpu: 0.2
        memory: 1152Mi
    stateful:
      size: 4Gi
    env:
      ES_JAVA_OPTS: "-Xms1024m -Xmx1024m"

  ingest:
    replicas: 2
    resources:
      limits:
        cpu: 2
        memory: 2048Mi
      requests:
        cpu: 0.2
        memory: 1152Mi
    env:
      ES_JAVA_OPTS: "-Xms1024m -Xmx1024m"

  data:
    replicas: 3
    antiAffinity: "soft"
    resources:
      limits:
        cpu: 2
        memory: 4096Mi
      requests:
        cpu: 0.2
        memory: 2176Mi
    stateful:
      size: 24Gi
    env:
      ES_JAVA_OPTS: "-Xms2048m -Xmx2048m"

  kibana:
    replicas: 1
    resources:
      limits:
        cpu: 1000m
        memory: 2048Mi
      requests:
        cpu: 100m
    env:
      ES_JAVA_OPTS: "-Xmx1024m"

  ingress:
    domain: nais.example.com
```

If you are installing elasticsearch and the two client pods does not start as expected, log in to the master-1 pod using kubectl exec and run ```/sgadmin.sh```

Resizing volumes requires changing the persistent volume claim in kubernetes and then changing the helm chart definitions. Contact the nais team if you need the change the storage parameters.

## Metrics

General ceph metrics are available from several dashboards in grafana:

[Grafana Ceph Cluster]

[Grafana Ceph OSD]

[Open Distro Elasticsearch metric referencel]

## Code examples

Feel free to help us out by adding examples!

[navikt/nais-tpal]: https://github.com/navikt/nais-tpa.git
[helm]: https://helm.sh/
[#nais-tpa]: https://nav-it.slack.com/archives/CP8TKNK55
[Grafana Ceph Cluster]: https://grafana.adeo.no/d/vwcB0Bzml/ceph-cluster?orgId=1&refresh=10s
[Grafana Ceph OSD]: https://grafana.adeo.no/d/Fj5fAfzik/ceph-osd?orgId=1&refresh=15m
[Open Distro Elasticsearch metric referencel]: https://opendistro.github.io/for-elasticsearch-docs/docs/pa/reference/
