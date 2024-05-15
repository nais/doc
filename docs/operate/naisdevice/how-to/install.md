---
tags: [naisdevice, how-to]
---

# Install naisdevice

{% if tenant() == "nav" %}

!!! warning

    To make sure you are using naisdevice as securely as possible, make sure you are a member of the [Slack channel #naisdevice](https://nav-it.slack.com/archives/C013XV66XHB). Important information will be published there. This also where you find us, if you need any help.

## Prerequisites

- [Install the Kolide agent](./install-kolide.md).

!!! note

    On first time connection you will be presented with soft policies (aka. Do's & Don'ts)

{% endif %}

## Device-specific installation steps

=== "macOS"

    {% if tenant() == "nav" %}

    The Kolide agent will be added to your Slack app, and let you know when there are recommended updates or security issues you need to address - and how to address them. They have been vetted by the NAIS team and should be followed to keep your device safe.

    {% endif %}

    1. [Install Homebrew](https://brew.sh/) unless you already have it.

    Homebrew makes it possible to install and maintain apps using the terminal app on your Mac.

    1. Open terminal (Use `<Command> + <Space>` to find `Terminal.app`) and add the nais tap by typing or pasting the text below and press `<Enter>`.

    Adding the nais tap lets Homebrew know where to get and update files from. Do not worry about where it will be installed, we got you covered.

    ```bash
    brew tap nais/tap
    ```

    1. When the tap is added, you are ready to install naisdevice, by typing or pasting the following in terminal and press `<Enter>`.

    {% if tenant() == "nav" %}

    ```bash
    brew install naisdevice
    ```

    1. You will be asked for your local device account's password to finish the installation.
    1. The password is not accepted unless you have administrator privileges, so you need to get that first.
    1. If you're running a NAV Mac: Open your `Privileges.app` (Use `<Command> + <Space>` to find the `Privileges.app` and request privileges. When this is done, you can enter your password in terminal. The privileges last 10 minutes. The limited time is due to security reasons, because we know many of us forget to turn it off afterwards.

    {% else %}

    ```bash
    brew install naisdevice-tenant
    ```

    {% endif %}

    1. You will be asked for your local device account's password to finish the installation.
    1. Turn on your freshly installed `naisdevice` app.
    1. Use `<Command> + <Space>` to find your `naisdevice.app` and press `<Enter>`.
    1. Follow the [instructions to connect your _nais_ device](#connect-naisdevice-through-tasksys-tray-icon).

=== "Windows"

    #### Install using Scoop

    {% if tenant() == "nav" %}

    The Kolide agent will be added to your Slack app, and let you know when there are recommended updates or security issues you need to address - and how to address them. They have been vetted by the NAIS team and should be followed to keep your device safe.

    {% endif %}

    1. Install [Scoop](https://scoop.sh) unless you already have it.

    Scoop makes it possible to install and maintain programs from the command line.

    1. Use the following command in the command line to add the nais bucket to let Scoop know where to get and update files from. Do not worry about where it will be installed, we got you covered.

    ```powershell
    scoop bucket add nais https://github.com/nais/scoop-bucket
    ```

    1. When the bucket is added, you are ready to install naisdevice, by typing the following in the command line:

    {% if tenant() == "nav" %}

    ```powershell
    scoop install naisdevice
    ```

    {% else %}

    ```powershell
    scoop install naisdevice-tenant
    ```

    {% endif %}

    (you will be asked for administrator access to run the installer)
    1. Start _naisdevice_ from the _Start menu_

=== "Manual"

    {% if tenant() == "nav" %}

    [Install Kolide agent](install-kolide.md).

    The Kolide agent will be added to your Slack app, and let you know when there are recommended updates or security issues you need to address - and how to address them. They have been vetted by the NAIS team and should be followed to keep your device safe.

    [Download and install naisdevice.exe](https://github.com/nais/device/releases/latest)

    {% else %}

    [Download and install naisdevice-tenant.exe](https://github.com/nais/device/releases/latest)

    {% endif %}

    (you will be asked for administrator access when you run the installer)

    1. Start _naisdevice_ from the _Start menu_

=== "Ubuntu"

    !!! warning

        Using Gnome DE on latest Ubuntu LTS - only supported variant atm

    1. Add the nais PPA repo:

    ```
    NAIS_GPG_KEY="/etc/apt/keyrings/nav_nais_gar.asc"
    curl -sfSL "https://europe-north1-apt.pkg.dev/doc/repo-signing-key.gpg" | sudo dd of="$NAIS_GPG_KEY"
    echo "deb [arch=amd64 signed-by=$NAIS_GPG_KEY] https://europe-north1-apt.pkg.dev/projects/nais-io nais-ppa main" | sudo tee /etc/apt/sources.list.d/nav_nais_gar.list
    sudo apt update
    ```

    **NOTE** curl is not installed in a "fresh" ubuntu:

    ```
    sudo apt install curl
    ```

    1. Install the naisdevice package:

    {% if tenant() == "nav" %}

    ```
    sudo apt install naisdevice
    ```

    {% else %}

    ```
    sudo apt install naisdevice-tenant
    ```

    {% endif %}

    1. Turn on your freshly installed `naisdevice` application.
    1. Find `naisdevice` in your application menu, or use the `naisdevice` command in a terminal to start the application.
    2. Follow the [instructions to connect your _nais_ device](#connect-naisdevice-through-tasksys-tray-icon).

{% if tenant() == "nav" %}

!!! warning

    On first time connection you will be presented with soft policies (aka. Do's & Don'ts)

{% endif %}

## Connect naisdevice through task/sys -tray icon

![A macOS systray exemplifying a red-colored `naisdevice` icon.](../../../assets/naisdevice-systray-icon.svg)

When you have opened naisdevice, you may be concerned that nothing happened. The little naisdevice icon has appeared in your Systray (where all your small program icons are located - see above picture for how it looks on Mac):

1. Find your `naisdevice` icon (pictured above - though it should not be red at first attempted connection).
- Can't find the icon? Make sure it is installed (See [macOS](#macos-installation), [Windows](#windows-installation) or [Ubuntu](#ubuntu-installation))
1. Left-click it and select `Connect`.
1. Left-click the `naisdevice` icon again and click `Connect`.
You might need to allow ~20 seconds to pass before clicking `Connect` turns your `naisdevice` icon green.
