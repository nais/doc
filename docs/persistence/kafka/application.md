# Application

!!! warning
    This feature applies only to _Aiven hosted Kafka_. On-premises Kafka is deprecated, and creating new topics on-premises was disabled summer 2021. For on-premises Kafka, see [on-premises Kafka documentation](https://confluence.adeo.no/display/AURA/Kafka).

## Application config

These variables are made available inside the pod.

| Variable name | Description |
| :--- | :--- |
| `KAFKA_BROKERS` | Comma-separated list of HOST:PORT pairs to Kafka brokers |
| `KAFKA_SCHEMA_REGISTRY` | URL to schema registry |
| `KAFKA_SCHEMA_REGISTRY_USER` | Username to use with schema registry |
| `KAFKA_SCHEMA_REGISTRY_PASSWORD` | Password to use with schema registry |
| `KAFKA_CERTIFICATE` | Client certificate for connecting to the Kafka brokers, as string data |
| `KAFKA_CERTIFICATE_PATH` | Client certificate for connecting to the Kafka brokers, as file |
| `KAFKA_PRIVATE_KEY` | Client certificate key for connecting to the Kafka brokers, as string data |
| `KAFKA_PRIVATE_KEY_PATH` | Client certificate key for connecting to the Kafka brokers, as file |
| `KAFKA_CA` | Certificate authority used to validate the Kafka brokers, as string data |
| `KAFKA_CA_PATH` | Certificate authority used to validate the Kafka brokers, as file |
| `KAFKA_CREDSTORE_PASSWORD` | Password needed to use the keystore and truststore |
| `KAFKA_KEYSTORE_PATH` | PKCS\#12 keystore for use with Java clients, as file |
| `KAFKA_TRUSTSTORE_PATH` | JKS truststore for use with Java clients, as file |
| `AIVEN_SECRET_UPDATED` | A timestamp of when the secret was created |

## What happens on deploy?

When you deploy an application that requests access to Kafka, Naiserator will create an `AivenApplication` resource in the cluster.
The `AivenApplication` has a name that matches the deployed application, and the name of the secret to generate. 
Naiserator will request that a secret with this name used in the deployment.

When an `AivenApplication` resource is created or updated, Aivenator will create a new service user and generate credentials. 
These credentials are then inserted into the requested secret and used in the deployment.

If there is a problem generating the secret, this might fail your deployment. 
In this case, Aivenator will update the `status` part of the resource, with further information about the problem.

## Testing your application

If you need to test that you have configured your consumer application correctly, you can use one of the kafkarator-canary topics.
All applications (from all teams) have read access to the canary topics.
All the canary topics receives a message on a fixed interval, containing a RFC3339 formatted timestamp.
The only difference between each, is where the producer is located.
The available canary topics are:

| Pool     | Topic name                      |
| :------- | :------------------------------ |
| nav-dev  | aura.kafkarator-canary-dev-gcp  |
| nav-dev  | aura.kafkarator-canary-dev-sbs  |
| nav-dev  | aura.kafkarator-canary-dev-fss  |
| nav-prod | aura.kafkarator-canary-prod-gcp |
| nav-prod | aura.kafkarator-canary-prod-sbs |
| nav-prod | aura.kafkarator-canary-prod-fss |



## Application design guidelines

### Authentication and authorization

The NAIS platform will generate new credentials when your applications is deployed. Kafka requires TLS client certificates for authentication. Make sure your Kafka and/or TLS library can do client certificate authentication, and that you can specify a custom CA certificate for server validation.

### Readiness and liveness

Making proper use of liveness and readiness probes can help with many situations. 
If producing or consuming Kafka messages are a vital part of your application, you should consider failing one or both probes if you have trouble with Kafka connectivity.
Depending on your application, failing liveness might be the proper course of action.
This will make sure your application is restarted when it is experiencing problems, which might help.

In other cases, failing just the readiness probe will allow your application to continue running, attempting to move forward without being killed.
Failing readiness will be most helpful during deployment, where the old instances will keep running until the new are ready.
If the new instances are not able to connect to Kafka, keeping the old ones until the problem is resolved will allow your application to continue working.
