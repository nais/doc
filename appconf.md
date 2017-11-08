# Application configuration
Fasit resources will be available to the application as environment variables. The name will be will be in CAPITAL letters, and . will be replaced with _

| Alias  | ResourceName         |Environment Variable     |
| ------ | ---------------------|-------------------------|
| ldap   | serviceuser.username |LDAP_SERVICEUSER_USERNAME|
| naisDB | url                  |NAISDB_URL               |

The exception is resources of the type "application properties", where the environment variable is not alise prefixed

| Alias  | Content                  |Environment Variable     |
| ------ | ---------------------    |-------------------------|
| sam-logging  | log.level=INFO	    |LOG_LEVEL          |
| ekstraKonfig | SELFTEST_TIMEOUT=10                  |SELFTEST_TIMEOUT               |
| ekstraKonfig | url.to.foo=http://example.tld       |URL_TO_FOO               |
