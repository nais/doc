# nais-cli

nais-cli is a simple CLI application that developers in NAV can use.

## Prerequisites

You need to be logged in with [naisdevice](../device/install.md) to use this cli.
Then follow our [installation](install.md) guide.

## Usage

See the chapters under commands in the sidebar.

Note that NAIS-cli requires all flags to appear before arguments (otherwise the flags will be interpreted as arguments).

OK:
```
nais postgres --context dev-gcp --namespace dreamteam proxy
```

Not OK:
```
nais postgres proxy --context dev-gcp --namespace dreamteam
```
