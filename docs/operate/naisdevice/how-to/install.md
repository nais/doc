---
tags: [naisdevice, how-to]
---

# Install naisdevice

{% if tenant() == "nav" %}

!!! warning

    The issues reported by Kolide _**must**_ be addressed - these remediations have been vetted by the Nais team and should be followed. Depending on the issue, you might lose `naisdevice` connectivity if an issue is left unresolved for a sufficient length of time.

    To make sure you are using naisdevice as securely as possible, make sure you are a member of the [Slack channel #naisdevice](https://nav-it.slack.com/archives/C013XV66XHB). Important information will be published there. This also where you find us, if you need any help.

{% endif %}

## Device-specific installation steps

=== "macOS"

    {% if tenant() == "nav" %}
    1. Go [here](https://auth.kolide.com/device/registrations/new?organization_id=1401), log in, and follow the prompts.
        1. If Kolide reports any issues, follow the instructions on how to remediate them.
           If a remediation required by Kolide makes you feel unsafe - feel free to ask in [#naisdevice Slack channel](https://nav-it.slack.com/archives/C013XV66XHB).
    {% endif %}
    1. Install [Homebrew](https://brew.sh/) unless you already have it.
    1. Run these commands in a terminal
    ```bash
    brew tap nais/tap
    brew install <<naisdevice_name()>>
    ```
    1. You will be asked for your local device account's password to finish the installation.
    {% if tenant() == "nav" %}
        1. The password is not accepted unless you have administrator privileges, so you need to get that first.
        1. If you're running a NAV Mac: Open your `Privileges.app` (Use `<Command> + <Space>` to find the `Privileges.app` and request privileges. When this is done, you can enter your password in terminal. The privileges last 10 minutes. The limited time is due to security reasons, because we know many of us forget to turn it off afterwards.
    {% endif %}
    1. Turn on your freshly installed `naisdevice` app.
    1. Use `<Command> + <Space>` to find your `naisdevice.app` and press `<Enter>`.

=== "Windows (Scoop)"

    {% if tenant() == "nav" %}
    1. Go [here](https://auth.kolide.com/device/registrations/new?organization_id=1401), log in, and follow the prompts.
        1. If Kolide reports any issues, follow the instructions on how to remediate them.
           If a remediation required by Kolide makes you feel unsafe - feel free to ask in [#naisdevice Slack channel](https://nav-it.slack.com/archives/C013XV66XHB).
    {% endif %}
    1. Install [Scoop](https://scoop.sh) unless you already have it.
    ```powershell
    Scoop makes it possible to install and maintain programs from the command line.
    ```

    1. Use the following command in the command line to add the nais bucket to let Scoop know where to get and update files from. Do not worry about where it will be installed, we got you covered.
    ```powershell
    scoop bucket add nais https://github.com/nais/scoop-bucket
    ```

    1. When the bucket is added, you are ready to install naisdevice, by typing the following in the command line:
    ```powershell
    scoop install <<naisdevice_name()>>
    ```
      (you will be asked for administrator access to run the installer)

    1. Start _naisdevice_ from the _Start menu_

=== "Winows (Manual)"

    {% if tenant() == "nav" %}
    1. Go [here](https://auth.kolide.com/device/registrations/new?organization_id=1401), log in, and follow the prompts.
        1. If Kolide reports any issues, follow the instructions on how to remediate them.
           If a remediation required by Kolide makes you feel unsafe - feel free to ask in [#naisdevice Slack channel](https://nav-it.slack.com/archives/C013XV66XHB).
    {% endif %}
    1. Go to [github.com/nais/device](https://github.com/nais/device/releases/latest).
    1. Download and run the newest `<<naisdevice_name()>>.exe` installer (you will be asked for administrator access when you run the installer).
    1. Start _naisdevice_ from the _Start menu_.

=== "Ubuntu"

    !!! warning

        Using Gnome DE on latest Ubuntu LTS - only supported variant

    {% if tenant() == "nav" %}
    1. Go [here](https://auth.kolide.com/device/registrations/new?organization_id=1401), log in, and follow the prompts.
        1. If Kolide reports any issues, follow the instructions on how to remediate them.
           If a remediation required by Kolide makes you feel unsafe - feel free to ask in [#naisdevice Slack channel](https://nav-it.slack.com/archives/C013XV66XHB).
    {% endif %}
    1. Install curl
    ```
    sudo apt install curl
    ```

    1. Add the nais PPA repo:
    ```
    NAIS_GPG_KEY="/etc/apt/keyrings/nav_nais_gar.asc"
    curl -sfSL "https://europe-north1-apt.pkg.dev/doc/repo-signing-key.gpg" | sudo dd of="$NAIS_GPG_KEY"
    echo "deb [arch=amd64 signed-by=$NAIS_GPG_KEY] https://europe-north1-apt.pkg.dev/projects/nais-io nais-ppa main" | sudo tee /etc/apt/sources.list.d/nav_nais_gar.list
    sudo apt update
    ```

    1. Install the naisdevice package:
    ```
    sudo apt install <<naisdevice_name()>>
    ```

    1. Find `naisdevice` in your application menu, or use the `naisdevice` command in a terminal to start the application.

## Connect naisdevice through task/sys -tray icon

![A macOS systray exemplifying a red-colored `naisdevice` icon.](../../../assets/naisdevice-systray-icon.svg)

When you have opened naisdevice the naisdevice icon appears in your Systray (where all your small program icons are located - see above picture for how it looks on Mac):

1. Find your `naisdevice` icon (pictured above).
   - Can't find the icon? Make sure it is installed (See [macOS](#__tabbed_1_2), [Windows (Scoop)](#__tabbed_1_1) or [Ubuntu](#__tabbed_1_4))
2. Left-click it and select `Connect`.
3. Left-click the `naisdevice` icon again and click `Connect`.
   - You might need to allow ~20 seconds to pass before clicking `Connect` turns your `naisdevice` icon green.
