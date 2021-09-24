# Installation

## Prerequisite

1. If you haven't already...
    1. Install and authenticate with [naisdevice](../device/install.md). 
    2. Set up [Kubeconfigs](https://github.com/navikt/kubeconfigs) for NAV clusters.
    3. Install [Homebrew](https://brew.sh/).
2. Tool is used in GCP?

```bash
gcloud auth login
``` 

## Installation

Add nais/tap;

```bash
brew tap nais/tap
```

3. Install the nais-cli;

```bash
brew install nais
```

## Update

Checkout official [Homebrew](https://docs.brew.sh/FAQ) documentation.

## Uninstall

Uninstall nais-cli Homebrew Cask;

```bash
brew uninstall --force nais
```
