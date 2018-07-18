NAV proxy
=========

NAV uses proxy to intercept all network trafficking. So to reach internet outside you need to go through the procy.

For users running Linux-VDI, [utvikler-ansible](https://github.com/navikt/utvikler-ansible) is the recommended tool, as it will set up proxy other importans tools automatically.


## System environment variables

You need the following variables set:

```text
http_proxy=http://webproxy-utvikler.nav.no:8088
https_proxy=http://webproxy-utvikler.nav.no:8088
no_proxy=localhost,127.0.0.1,*.adeo.no,.local,.adeo.no,.nav.no,.aetat.no,.devillo.no,.oera.no,devel
```
