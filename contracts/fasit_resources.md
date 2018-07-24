Fasit resources
===============

> Also called application configuration

Fasit resources can be available to the application as environment variables. The name will be will be in `CAPITAL` letters, and `.` will be replaced with `_`.


## Mapping

Example of mappings:

| Alias  | ResourceName         | Environment Variable      |
| ------ | -------------------- | ------------------------- |
| ldap   | serviceuser.username | LDAP_SERVICEUSER_USERNAME |
| naisDB | url                  | NAISDB_URL                |


### Application properties

The exception is resources of the type `application properties`, where the alias is not used as a prefix for the environment variable.

| Alias        | Content                       | Environment Variable |
| ------------ | ----------------------------- | -------------------- |
| sam-logging  | log.level=INFO	               | LOG_LEVEL            |
| ekstraKonfig | SELFTEST_TIMEOUT=10           | SELFTEST_TIMEOUT     |
| ekstraKonfig | url.to.foo=http://example.tld | URL_TO_FOO           |
