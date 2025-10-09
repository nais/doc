---
tags: [kafka, reference]
conditional: [not-test-nais]
---

# Environment variables for Kafka

These variables are made available to your application when Kafka is enabled.

| Variable name                    | Description                                                                |
|:---------------------------------|:---------------------------------------------------------------------------|
| `KAFKA_BROKERS`                  | Comma-separated list of HOST:PORT pairs to Kafka brokers                   |
| `KAFKA_SCHEMA_REGISTRY`          | URL to schema registry                                                     |
| `KAFKA_SCHEMA_REGISTRY_USER`     | Username to use with schema registry                                       |
| `KAFKA_SCHEMA_REGISTRY_PASSWORD` | Password to use with schema registry                                       |
| `KAFKA_CERTIFICATE`              | Client certificate for connecting to the Kafka brokers, as string data     |
| `KAFKA_CERTIFICATE_PATH`         | Client certificate for connecting to the Kafka brokers, as file            |
| `KAFKA_PRIVATE_KEY`              | Client certificate key for connecting to the Kafka brokers, as string data |
| `KAFKA_PRIVATE_KEY_PATH`         | Client certificate key for connecting to the Kafka brokers, as file        |
| `KAFKA_CA`                       | Certificate authority used to validate the Kafka brokers, as string data   |
| `KAFKA_CA_PATH`                  | Certificate authority used to validate the Kafka brokers, as file          |
| `KAFKA_CREDSTORE_PASSWORD`       | Password needed to use the keystore and truststore                         |
| `KAFKA_KEYSTORE_PATH`            | PKCS\#12 keystore for use with Java clients, as file                       |
| `KAFKA_TRUSTSTORE_PATH`          | JKS truststore for use with Java clients, as file                          |
| `AIVEN_SECRET_UPDATED`           | A timestamp of when the secret was created                                 |

Aiven has written several articles on how to configure your application.
We use SSL, so ignore the SASL-SSL examples:

- [Java](https://aiven.io/docs/products/kafka/howto/connect-with-java)
- [Python](https://aiven.io/docs/products/kafka/howto/connect-with-python)
- [Node.js](https://aiven.io/docs/products/kafka/howto/connect-with-nodejs)
- [Go](https://aiven.io/docs/products/kafka/howto/connect-with-go)
