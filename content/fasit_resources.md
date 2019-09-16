# Fasit resources

> Also called application configuration

Fasit resources can be available to the application as environment variables. The name will be will be in `CAPITAL` letters, and `.` will be replaced with `_`.

## Mapping

Example of mappings:

| Alias | ResourceName | Environment Variable |
| :--- | :--- | :--- |
| ldap | serviceuser.username | LDAP\_SERVICEUSER\_USERNAME |
| naisDB | url | NAISDB\_URL |

### Application properties

The exception is resources of the type `application properties`, where the alias is not used as a prefix for the environment variable.

| Alias | Content | Environment Variable |
| :--- | :--- | :--- |
| sam-logging | log.level=INFO | LOG\_LEVEL |
| ekstraKonfig | SELFTEST\_TIMEOUT=10 | SELFTEST\_TIMEOUT |
| ekstraKonfig | url.to.foo=[http://example.tld](http://example.tld) | URL\_TO\_FOO |

