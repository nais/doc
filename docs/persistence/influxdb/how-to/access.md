---
tags: [influxdb, how-to]
conditional: [tenant, nav]
---

# Access from NAIS-app

You need to specify the InfluxDB instance to get access from an application. See [nais.yaml-reference](../../../workloads/application/reference/application-spec.md#influxinstance).

When an application requesting an InfluxDB instance is deployed, credentials will be provided as environment variables.
There is only one user for Influxdb, with complete access.
The service URI and the name of the database is also available, as well as the relevant project Certificate Authority.

| Environment variable | Description                 |
|----------------------|-----------------------------|
| INFLUXDB_USERNAME    | Username                    |
| INFLUXDB_PASSWORD    | Password                    |
| INFLUXDB_URI         | Service URI                 |
| INFLUXDB_NAME        | Database name               |
| AIVEN_CA             | Aiven certificate authority | 
