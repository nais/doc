# aiven command

The aiven command can be used to create a AivenApplication and extract credentials. The `aiven create` command will
create a Protected & time-limited AivenApplication in your specified namespace.

This command will give access to personal but time limited credentials. These credentials can be used to debug an Aiven
hosted kafka topic. The `aiven get` command extracts the credentials and puts them in `/tmp` folder. The created
AivenApplication has sane default (days-to-live) set to 1 day.

To gain access to a specific topic be sure to update your topic resource and topic ACLs. Add `username`
to `acl.application` field in your topic.yaml and apply to your namespace.

```yaml
# topic.yml
spec:
  pool: nav-integration-test
  config:
    retentionHours: 900
  acl:
    - access: write
      team: test
      application: username
```

## create

```bash
nais aiven create username namespace
```

| Argument    | Required  | Description                                                 |          
|-------------|-----------|-------------------------------------------------------------|
| username    | Yes       | Preferred username.                                         |
| namespace   | Yes       | Kubernetes namespace where AivenApplication will be created.|

```bash
nais aiven create username namespace -p nav-prod -s some-unique-secretname -e 10
```

| Flag          | Required   | Short   |Default                                |Description                                        |      
|---------------|------------|---------|---------------------------------------|---------------------------------------------------|
| pool          | No         | -p      |  nav-dev                              | [Kafka pool](../../persistence/kafka/index.md).   |
| secret-name   | No         | -s      |  namespace-username-randomstring      | Preferred secret-name.                            |
| expire        | No         | -e      |  1                                    | Time in days the secret should be valid.          |

## get

```bash
nais aiven get secret-name namespace
```

| Argument          | Required  | Description                                                                    |          
|-------------------|-----------|--------------------------------------------------------------------------------|
| secret-name       | Yes       | Default secret-name or flag `-s` in `create` command.                          |
| namespace         | Yes       | Kubernetes namespace for the created AivenApplication.                         |

```bash
nais aiven get secret-name namespace -c kcat
```

| Flag             | Required    | Short   |Default            |Description                                                        |      
|------------------|-------------|---------|----------------------|-------------------------------------------------------------------|
| config           | No          | -c      |  all                 | Type of config to generated, supported values: .env, kcat, all.   |

## tidy

Removes folders in `/tmp` ($TMPDIR) directory that starts with `aiven-secret-`.

```bash
nais aiven tidy
```

## Available output

After Successful `nais aiven create` and `nais aiven get` commands, a set of files wil be available.

### Configuration

You can specify a configuration `flag` to generate `all | kcat | .env`. Default is `all`

#### all

- client.keystore.p12
- client.truststore.jks
- kafka-ca.pem
- kafka-certificate.crt
- kafka-private-key.pem
- kafka-secret.env
- kcat.conf

#### .env

- client.keystore.p12
- client.truststore.jks
- kafka-ca.pem
- kafka-certificate.crt
- kafka-private-key.pem
- kafka-secret.env

##### kafka-secret.env file

```Properties
KAFKA_BROKERS="<broker uri>"
KAFKA_CA="<ca certificate>"
KAFKA_CA_PATH="<path to ca certificate>"
KAFKA_CERTIFICATE="<client certificate>"
KAFKA_CERTIFICATE_PATH="<path to client certificate>"
KAFKA_CREDSTORE_PASSWORD="<password for keystore/truststore>"
KAFKA_KEYSTORE_PATH="<path to keystore>"
KAFKA_PRIVATE_KEY="<private key>"
KAFKA_PRIVATE_KEY_PATH="<path to private key>"
KAFKA_SCHEMA_REGISTRY="<schema registry uri>"
KAFKA_SCHEMA_REGISTRY_PASSWORD="<schema registry password>"
KAFKA_SCHEMA_REGISTRY_USER="<schema registry username>"
KAFKA_TRUSTSTORE_PATH="<path to truststore>"
```

#### kcat

- kafka-ca.pem
- kafka-client-certificate.crt
- kafka-client-private-key.pem
- kcat.conf

##### kcat.conf file

```Properties
bootstrap.servers=<broker uri>
ssl.certificate.location=<path to client certificate>
ssl.key.location=<path to private key>
ssl.ca.location=<path to ca certificate>
security.protocol=ssl
```

The generated `kcat.conf` can be used with [kcat](https://github.com/edenhill/kcat) to authenticate against the Aiven
hosted topics in GCP.

Read more about kcat.conf [configurable properties](https://github.com/edenhill/librdkafka/blob/master/CONFIGURATION.md)
.

You can refer to generated config with -F flag:

```
kcat -F path/to/kcat.conf -t namespace.your.topic
```

Alternatively, you can specify the same settings directly on the command line:

```
kcat \
    -b boostrap-server.aivencloud.com:26484 \
    -X security.protocol=ssl \
    -X ssl.key.location=service.key \
    -X ssl.certificate.location=service.cert \
    -X ssl.ca.location=ca.pem
```

For more details [aiven-kcat](https://help.aiven.io/en/articles/2607674-using-kafkacat)
