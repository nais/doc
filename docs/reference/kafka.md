# Kafka

## Environment variables for Kafka

These variables are made available to your application when Kafka is enabled.

| Variable name                    | Description                                                                |
| :------------------------------- | :------------------------------------------------------------------------- |
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


## Authentication and authorization

The NAIS platform will generate new credentials when your applications is deployed. Kafka requires TLS client certificates for authentication. Make sure your Kafka and/or TLS library can do client certificate authentication, and that you can specify a custom CA certificate for server validation.

## Readiness and liveness

Making proper use of liveness and readiness probes can help with many situations.
If producing or consuming Kafka messages are a vital part of your application, you should consider failing one or both probes if you have trouble with Kafka connectivity.
Depending on your application, failing liveness might be the proper course of action.
This will make sure your application is restarted when it is experiencing problems, which might help.

In other cases, failing just the readiness probe will allow your application to continue running, attempting to move forward without being killed.
Failing readiness will be most helpful during deployment, where the old instances will keep running until the new are ready.
If the new instances are not able to connect to Kafka, keeping the old ones until the problem is resolved will allow your application to continue working.
