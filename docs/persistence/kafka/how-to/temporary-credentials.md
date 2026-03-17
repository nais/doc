---
tags: [kafka, how-to]
---

# Get temporary Kafka credentials

Use the [nais-cli](../../../operate/cli/README.md) to get temporary credentials for Kafka.
This is useful for debugging, running `kafka-consumer-groups.sh`, or connecting from outside Nais.

```shell
nais kafka credentials \
    --team <team> \
    --environment <environment> \
    --ttl <duration>
```

where

- `<team>` is the name of the team.
- `<environment>` is the environment where Kafka runs (e.g. `dev`, `prod`).
- `<duration>` is how long the credentials should be valid (e.g. `1d`, `7d`, max `30d`).

The default output format is environment variables. Use `--output` to change format:

| Format | Description |
|--------|-------------|
| `env`  | Environment variables (default) |
| `kcat` | Configuration file for [kcat](https://github.com/edenhill/kcat) |
| `java` | Java properties file for `kafka-console-consumer.sh` and similar tools |

The `kcat` and `java` formats write configuration files to a temporary directory and print the path.

The credentials expire automatically when the TTL runs out. To get fresh credentials, simply run the command again.
