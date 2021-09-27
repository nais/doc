# aiven command

The aiven command can be used to create a AivenApplication and extract credentials. The `aiven create` command will
create a Protected & time-limited AivenApplication in your specified namespace.

This command will give access to personal but time limited credentials. These credentials can be used to debug an Aiven
hosted kafka topic. The `aiven get` command extracts the credentials and puts them in `/tmp` folder. The created
AivenApplication has sane default (days-to-live) set to 1 day.

To gain access to a specific topic be sure to update your topic resource and topic ACLs.
Add `username` to `acl.application` field in your topic.yaml and apply to your namespace.

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
nais aiven get secret-name namespace -d /my-temp-folder/ -c kcat
```

| Flag          | Required    | Short   |Default               |Description                                                        |      
|------------------|----------|---------|----------------------|-------------------------------------------------------------------|
| dest             | No       | -d      |  system `/tmp`       | Other then system default `/tmp` folder.                          |
| secret-name      | No       | -c      |  all                 | Type of config to generated, supported values: .env, kcat, all.   |

## tidy

Removes folders in `/tmp` ($TEMPDIR) directory that starts with `aiven-secret-`.

```bash
nais aiven tidy
```
