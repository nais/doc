
# Avro and schema

!!! warning
    This feature applies only to _Aiven hosted Kafka_. On-premises Kafka is deprecated, and creating new topics on-premises was disabled summer 2021. For on-premises Kafka, see [on-premises Kafka documentation](https://confluence.adeo.no/display/AURA/Kafka).

## Delete schema

You can delete schemaes (or versions) using the REST-API for the schema registry.
The easiest way to communicate with the API is to use curl from one of your Kafka-pods, so that you have easy access to both the schema registry URL and the username/password.

In order to delete version 10 of the schema registered under subject "test-key" (if it exists):

```
$ curl -X DELETE -u brukernavn:passord http://$KAFKA_SCHEMA_REGISTRY/subjects/test-key/versions/10
  10
```

To delete all versions of the schema registered under subject "test-key":
```
$ curl -X DELETE -u brukernavn:passord http://$KAFKA_SCHEMA_REGISTRY/subjects/test-key
  [1]
```

# REST API

For applications that can't use Kafka directly, a REST API is possible.
Because of security implications, we have not enabled the REST API on the cluster, but interested parties may run their own instance.

We have packaged [Aivens Karapace](https://github.com/aiven/karapace) project in a NAIS-friendly package.
Teams can install [Karapace](https://github.com/nais/karapace) in their own namespace with relevant access to provide a REST API for Kafka topics.
Check the Karapace Readme for details.
