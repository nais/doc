# nais-cli

nais-cli is a CLI application that provides some useful commands and utilities for interacting with the NAIS platform.

## Prerequisites

- [naisdevice](../naisdevice/README.md) 

## Installation

- [Install nais-cli](how-to/install.md)

## Usage

See available subcommands under the Reference section in the navigation sidebar.

!!! warning "Flag ordering"
    
    nais-cli requires all flags to appear **before** arguments. Otherwise, the flags will be interpreted as arguments.

    :white_check_mark: OK:
    ```shell
    nais start --topics events appname teamname
    ```

    :x: Not OK:

    ```shell
    nais start appname teamname --topics events
    ```

## Telemetry

We collect simple telemetry about usage and error messages to get a view of which features are used, and what kind of problems our users have with using the tool.
If you don't want to share your usage you can opt out following the [Console Do Not Track (DNT)](https://consoledonottrack.com/) standard.

Copy this into your terminal, or even better add it to your shell-config (for example `.zshrc` or `.bashrc`):

``` shell
export DO_NOT_TRACK=1
```
