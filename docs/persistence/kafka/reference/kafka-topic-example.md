---
tags: [kafka, reference]
---

# Nais Topic example YAML

<!--
  This documentation was automatically generated by the liberator pipeline.
  See https://github.com/nais/liberator/actions for details.
  
  DO NOT MAKE MANUAL CHANGES TO THIS FILE, THEY WILL BE OVERWRITTEN!
-->

This is a complete example of an `Topic` resource, commonly known as the `topic.yaml` file.

For an in-depth explanation of each field, head over to the [reference documentation](./kafka-topic-spec.md).
``` yaml
apiVersion: kafka.nais.io/v1
kind: Topic
metadata:
  creationTimestamp: null
  labels:
    team: myteam
  name: mytopic
  namespace: myteam
spec:
  acl:
  - access: read
    application: consumer
    team: otherteam
  - access: write
    application: producer
    team: myteam
  - access: readwrite
    application: processor
    team: myteam
  config:
    cleanupPolicy: delete
    deleteRetentionHours: 24
    localRetentionBytes: 1000
    localRetentionHours: 68
    maxCompactionLagMs: 60000
    maxMessageBytes: 1048588
    minCompactionLagMs: 10000
    minimumInSyncReplicas: 2
    partitions: 1
    replication: 3
    retentionBytes: 6000
    retentionHours: 168
    segmentHours: 168
  pool: dev-nais-dev
```
