---
title: Additional users
tags: [postgres, users, how-to]
---

You can add users to your database by setting database configuration option:
`.spec.gcp.sqlInstances[].databases[].users[].name`.
Additional users needs to manually be given access to the database and table.
Either directly or with Flyway or other database migration tools.

Names added must match regex: `^[_a-zA-Z][_a-zA-Z0-9]+$`. Secrets is generated and mounted for each user.

!!! info
    If you've deployed your application with an additional users, and then change name or remove the user from configuration, you need to _manually_ delete the `google-sql-<MYAPP>-<USER>` secret:
    ```bash
    $ kubectl delete secret google-sql-<MYAPP>-<USER>
    ```


## Examples

### Adding two additional users

```yaml title="app.yaml" hl_lines="7-8"
spec:
  gcp:
    sqlInstances:
      - databases:
        - name: mydb
          users:
            - name: user-two
            - name: user-three3
```

Your application will get two additional secrets created, with environment variables for each user.
They will look something like this:

```bash
NAIS_DATABASE_USER_TWO_MYDB_DATABASE=mydb
NAIS_DATABASE_USER_TWO_MYDB_HOST=10.11.12.13
NAIS_DATABASE_USER_TWO_MYDB_PORT=5432
NAIS_DATABASE_USER_TWO_MYDB_PASSWORD=not-really-a-password
NAIS_DATABASE_USER_TWO_MYDB_USERNAME=user-two
NAIS_DATABASE_USER_TWO_MYDB_URL=postgres://user-two:not-really-a-password@10.11.12.13:5432/mydb?sslmode=verify-ca&sslcert=%2Fvar%2Frun%2Fsecrets%2Fnais.io%2Fsqlcertificate%2Fcert.pem&...
NAIS_DATABASE_USER_TWO_MYDB_JDBC_URL=jdbc:postgresql://10.11.12.13:5432/mydb?password=not-really-a-password&user=contests&sslcert=%2Fvar%2Frun%2Fsecrets%2Fnais.io%2Fsqlcertificate%2Fcert.pem&...
``` 

### Adding additional user with custom env var prefix

```yaml title="app.yaml" hl_lines="7 8"
spec:
  gcp:
    sqlInstances:
      - databases:
        - name: mydb
          users:
            - name: user-two
          envVarPrefix: "PWNED"
```

The secret will then contain environment variables like this:

```bash
PWNED_USER_TWO_DATABASE=mydb
PWNED_USER_TWO_HOST=10.11.12.13
PWNED_USER_TWO_PORT=5432
PWNED_USER_TWO_PASSWORD=not-really-a-password
PWNED_USER_TWO_USERNAME=user-two
PWNED_USER_TWO_URL=postgres://user-two:not-really-a-password@10.11.12.13:5432/mydb?sslmode=verify-ca&sslcert=%2Fvar%2Frun%2Fsecrets%2Fnais.io%2Fsqlcertificate%2Fcert.pem&...
PWNED_USER_TWO_JDBC_URL=jdbc:postgresql://10.11.12.13:5432/mydb?user=user-two&password=not-really-a-password&sslcert=%2Fvar%2Frun%2Fsecrets%2Fnais.io%2Fsqlcertificate%2Fcert.pem&...
```
