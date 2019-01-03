Vault
=====

Vault by Hashicorp is a tool for managing secrets. 
To make use of Vault as a secret backend you need to:

1. Give your application access to Vault.
2. Give yourself or your team access to Vault.
3. Provide the the secrets for your application to consume.
4. Enable Vault integration in your NAIS manifest config. 

The first three requirements are covered by a pull request to the following repo: [vault-iac](https://github.com/navikt/vault-iac/tree/master/terraform)
Enabling Vault integration in a NAIS application is covered below.

## NAIS manifest config

```
vault:
  enabled: true
```

This is best illustrated using an example

Given the following secrets in Vault:

![example](../_media/vault.jpg)

The application ***nais-testapp*** deployed to the ***preprod-fss*** cluster in ***default*** namespace will get the secrets
injected as files with ***key*** as filename and ***value*** as file content:

```
~ # ls -lt /var/run/secrets/nais.io/vault/
total 8
-rw-r--r--    1 root     root            27 Sep 19 12:19 application.properties
-rw-r--r--    1 root     root            43 Sep 19 12:19 secret.yaml

~ # cat /var/run/secrets/nais.io/vault/application.properties 
value: value1
value: value2

~ # cat /var/run/secrets/nais.io/vault/secret.yaml 
database:
  user: user
  password: password
```

## Multiple KV stores

If you need to inject secrets from an additional KV store, you can do so by specifying the `paths` field.

Note that when you modify this field, the default behavior of mounting
`/kv/environment/zone/application/namespace` to `/var/run/secrets/nais.io/vault`
is no longer active, and if you need these secrets you need to specify them yourself.

```
vault:
  enabled: true
  paths:
    - kvPath: /secret/with/custom/path
      mountPath: /path/on/filesystem
    - kvPath: /kv/preprod/fss/nais-testapp/default  # default behavior
      mountPath: /var/run/secrets/nais.io/vault     # default behavior
```
