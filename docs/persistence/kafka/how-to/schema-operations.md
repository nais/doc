---
tags: [how-to, kafka]
---

# Avro and schema

This guide will show you how to do various schema operations on your Kafka topics.

!!! note 
    The easiest way to communicate with the API is to use `curl` from one of your Kafka-pods, so that you have easy access to both the schema registry URL and the username/password.

## Register schema

To register the first version of a schema under the subject "team.test-key" using **Avro schema**:

```
$ curl -X POST -u $KAFKA_SCHEMA_REGISTRY_USER:$KAFKA_SCHEMA_REGISTRY_PASSWORD -H "Content-Type: application/vnd.schemaregistry.v1+json" \
  --data '{"schema": "{\"type\": \"record\", \"name\": \"Obj\", \"fields\":[{\"name\": \"age\", \"type\": \"int\"}]}"}' \
  $KAFKA_SCHEMA_REGISTRY/subjects/team.test-key/versions
```

To register a version of a schema using **JSON Schema**, one needs to use schemaType property:

```
$ curl -X POST -u $KAFKA_SCHEMA_REGISTRY_USER:$KAFKA_SCHEMA_REGISTRY_PASSWORD -H "Content-Type: application/vnd.schemaregistry.v1+json" \
  --data '{"schemaType": "JSON", "schema": "{\"type\": \"object\",\"properties\":{\"age\":{\"type\": \"number\"}},\"additionalProperties\":true}"}' \
  $KAFKA_SCHEMA_REGISTRY/subjects/team.test-key/versions
```

## List versions of a schema

To list all the versions of a given schema (including the one just created above):

```
$ curl -u $KAFKA_SCHEMA_REGISTRY_USER:$KAFKA_SCHEMA_REGISTRY_PASSWORD $KAFKA_SCHEMA_REGISTRY/subjects/team.test-key/versions
```

## Fetch specific version of a schema

To get the specific version 1 of the schema just registered run:

```
$ curl -u $KAFKA_SCHEMA_REGISTRY_USER:$KAFKA_SCHEMA_REGISTRY_PASSWORD $KAFKA_SCHEMA_REGISTRY/subjects/team.test-key/versions/1
```

## Delete schema

In order to delete version 10 of the schema registered under subject "team.test-key" (if it exists):

```
$ curl -X DELETE -u $KAFKA_SCHEMA_REGISTRY_USER:$KAFKA_SCHEMA_REGISTRY_PASSWORD $KAFKA_SCHEMA_REGISTRY/subjects/team.test-key/versions/10
  10
```

To delete all versions of the schema registered under subject "team.test-key":

```
$ curl -X DELETE -u $KAFKA_SCHEMA_REGISTRY_USER:$KAFKA_SCHEMA_REGISTRY_PASSWORD $KAFKA_SCHEMA_REGISTRY/subjects/team.test-key
  [1]
```

# REST API

For applications that can't use Kafka directly, a REST API is possible.
Because of security implications, we have not enabled the REST API on the cluster, but interested parties may run their own instance.

We have packaged [Aivens Karapace](https://github.com/aiven/karapace) project in a NAIS-friendly package.
Teams can install [Karapace](https://github.com/nais/karapace) in their own namespace with relevant access to provide a REST API for Kafka topics.
Check the Karapace Readme for details.
