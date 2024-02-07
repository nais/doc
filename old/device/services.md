# Available services

## Available services

This document describes the different services you will get access to through naisdevice

* [all nais clusters](https://github.com/navikt/kubeconfigs/tree/naisdevice) 
* [kibana/logs.adeo.no](https://logs.adeo.no)
* [basta](https://basta.adeo.no)
* [vault](https://vault.adeo.no)
* [fasit](https://fasit.adeo.no)
* [vera](https://vera.intern.nav.no)
* [nexus/repo.adeo.no](https://repo.adeo.no)
* [bitbucket/stash](https://stash.adeo.no)
* [minwintid](https://minwintidmobil.adeo.no/minwintid)
* [data.adeo.no](https://data.adeo.no)
* [dolly](https://dolly.nais-dev-fss.adeo.no)
* VDI/Utviklerimage \(Use horizon.nav.no as connection server\)
* [Microsoft Teams](https://teams.microsoft.com/)
* [Microsoft Sharepoint/Navet](https://navno.sharepoint.com/)
* Postgres ([join this team to get access](https://account.activedirectory.windowsazure.com/r#/manageMembership?objectType=Group&objectId=a6816684-aced-43be-8791-451f18a266c5), [howto](#how-to-use-postgres-via-naisdevice))
* Oracle DEV ([join this team to get access](https://account.activedirectory.windowsazure.com/r#/manageMembership?objectType=Group&objectId=d45ad78e-6cb7-44a4-821b-db6f432da9e5))


## How to use Postgres via naisdevice

See also the Slack channel [#postgres-på-laptop](https://nav-it.slack.com/archives/C010WR3ALNR)

### Before connecting to Postgres

A few things need to be in place before you can connect.

* You must be a member of the `postgres-fra-laptop` [AD group](https://account.activedirectory.windowsazure.com/r#/manageMembership?objectType=Group&objectId=a6816684-aced-43be-8791-451f18a266c5).
* You need to perform a risk assessment (ROS).
* Whitelist your database for use with naisdevice in [database-iac](https://github.com/navikt/database-iac) by adding the following to the database entry:
    ```yaml
    naisdevice:
      enabled: true
      ros: <link to ROS>
    ```

### Connecting to Postgres from your laptop

1. Connect to the relevant naisdevice gateway:
    * dev: postgres-dev (automatically connected)
    * prod: postgres-prod (requires JITA)
2. Connect to the special naisdevice hostnames (these are only for use with naisdevice):
   * dev: dev-pg.intern.nav.no
   * prod: prod-pg.intern.nav.no
