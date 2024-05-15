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
