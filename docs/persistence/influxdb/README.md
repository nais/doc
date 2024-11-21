---
title: InfluxDB
tags: [influxdb, persistence, explanation]
conditional: [tenant, nav]
---

# InfluxDB

!!! warning "Deprcated"

    Aiven has announced end-of-life for InfluxDB as a service on April 30th, 2025. All existing instances will be terminated by that date.

## Suggested alternative

Team Digihot has spent some time piloting a concept that uses BigQuery and Metabase as a replacement for InfluxDB and Grafana.
They are very satisfied with the solution, and we have concluded that this is a viable replacement going forward.
In their case, all applications that sent data to InfluxDB also used Kafka, so their solution is based around Kafka.
Depending on the situation and use case, it would also be possible to send data to BigQuery directly from the applications.

Once the data is in BigQuery, you can use Metabase to create dashboards or dataproducts.

```mermaid
graph LR
    accTitle: From Kafka to Metabase via BigQuery
    accDescr: The diagram shows how the data is sent from the producer to Metabase. Producers on a kafka client, uses a kafka rapid, sending it to BigQuery sink ruler (BigQuery client) and BigQuery, that can be read from Metabase. Non-kafka apps can send data directly to BigQuery.

    P1[Producer 1<br><small>Kafka Client</small>] --> K
    P2[Producer 2<br><small>Kafka Client</small>] --> K

    K[Kafka Rapid] --> BQSR
    BQSR[BigQuery sink river<br><small>BigQuery Client</small>] --> BQ
    E[Non-Kafka App<br><small>BigQuery Client<small>] --> BQ

    BQ[BigQuery] --> M[Metabase]
```
