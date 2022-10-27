# Installation

!!! warning

    To make sure you are using naisdevice as securely as possible, make sure you are a member of the [Slack channel #naisdevice](https://nav-it.slack.com/archives/C013XV66XHB). Important information will be published there. This also where you find us, if you need any help. 

## Device-specific installation steps

### macOS Installation

1. [Install the Kolide agent](#install-kolide-agent). The Kolide agent will be added to your Slack app, and let you know when there are recommended updates or security issues you need to address - and how to address them. They have been vetted by the NAIS team and should be followed to keep your device safe.
2. [Install Homebrew](https://brew.sh/) unless you already have it. Homebrew makes it possible to install and maintain apps using the terminal app on your Mac.
3. Open terminal (Use `<Command> + <Space>` to find `Terminal.app`) and add the nais tap by typing or pasting the text below and press `<Enter>`. Adding the nais tap lets Homebrew know where to get and update files from. Do not worry about where it will be installed, we got you covered.
    ```bash
    brew tap nais/tap
    ```
4. When the tap is added, you are ready to install naisdevice, by typing or pasting the following in terminal and press `<Enter>`.
    ```bash
    brew install naisdevice
    ``` 
5. You will be asked for your local device account's password to finish the installation.
   1. The password is not accepted unless you have administrator privileges, so you need to get that first. 
   2. If you're running a NAV Mac: Open your `Privileges.app` (Use `<Command> + <Space>` to find the `Privileges.app` and request privileges. When this is done, you can enter your password in terminal. The privileges last 10 minutes. The limited time is due to security reasons, because we know many of us forget to turn it off afterwards.
6. Turn on your freshly installed `naisdevice` app.
   1. Use `<Command> + <Space>` to find your `naisdevice.app` and press `<Enter>`.
   2. Follow the [instructions to connect your _nais_ device](#connect-naisdevice-through-tasksys-tray-icon).
7. If you need to connect to anything running in K8s cluster, remember to [update your kubeconfig](https://docs.nais.io/device/install/#connecting-to-nais-clusters)

### Windows Installation

#### Install using Scoop

1. [Install Kolide agent](install.md#install-kolide-agent). The Kolide agent will be added to your Slack app, and let you know when there are recommended updates or security issues you need to address - and how to address them. They have been vetted by the NAIS team and should be followed to keep your device safe.
2. Install [Scoop](https://scoop.sh) unless you already have it. Scoop makes it possible to install and maintain programs from the command line.
3. Use the following command in the command line to add the nais bucket to let Scoop know where to get and update files from. Do not worry about where it will be installed, we got you covered.
   ```powershell
   scoop bucket add nais https://github.com/nais/scoop-bucket
   ```
4. When the bucket is added, you are ready to install naisdevice, by typing the following in the command line:
   ```powershell
   scoop install naisdevice
   ```
   (you will be asked for administrator access to run the installer)
5. If you need to connect to anything running in K8s cluster, remember to [update your kubeconfig](https://docs.nais.io/device/install/#connecting-to-nais-clusters)
6. Start _naisdevice_ from the _Start menu_

#### Manual installation

1. [Install Kolide agent](install.md#install-kolide-agent). The Kolide agent will be added to your Slack app, and let you know when there are recommended updates or security issues you need to address - and how to address them. They have been vetted by the NAIS team and should be followed to keep your device safe.
2. [Download and install naisdevice.exe](https://github.com/nais/device/releases/latest)
   (you will be asked for administrator access when you run the installer)
3. If you need to connect to anything running in K8s cluster, remember to [update your kubeconfig](https://docs.nais.io/device/install/#connecting-to-nais-clusters)
4. Start _naisdevice_ from the _Start menu_

### Ubuntu Installation

!!! warning

    Using Gnome DE on latest Ubuntu LTS - only supported variant atm

1. [Install Kolide agent](install.md#install-kolide-agent).
2. Add the nais PPA repo:
    ``` 
    NAIS_GPG_KEY="/usr/share/keyrings/nav_nais.gpg"
    curl -sfSL "https://ppa.nais.io/KEY.gpg" | gpg --dearmor | sudo dd of="$NAIS_GPG_KEY"
    echo "deb [signed-by=$NAIS_GPG_KEY] https://ppa.nais.io/ ./" | sudo tee /etc/apt/sources.list.d/nav_nais.list
    sudo apt update # Now you can apt install naisdevice
    ```
3. Intall the naisdevice package:
    ```
    sudo apt install naisdevice
    ```
4. Turn on your freshly installed `naisdevice` application.
    1. Find `naisdevice` in your application menu, or use the `naisdevice` command in a terminal to start the application.
    2. Follow the [instructions to connect your _nais_ device](#connect-naisdevice-through-tasksys-tray-icon).
5. Remember to [update your kubeconfig](install.md#connecting-to-nais-clusters).

## Installation steps, regardless of your device type

### Install Kolide agent

The Kolide agent will be added to your Slack app, and let you know when there are recommended updates or security issues you need to address - and how to address them. The apps are found in the bottom left of your Slack app (scroll, scroll, scroll).

!!! warning

    The issues reported by Kolide _**must**_ be addressed - these remediations have been vetted by the NAIS team and should be followed. Depending on the issue, you might lose `naisdevice` connectivity if an issue is left unresolved for a sufficient length of time. 

    If you run into problems, you can always ask in the [Slack channel #naisdevice](https://nav-it.slack.com/archives/C013XV66XHB)

You install Kolide by following these steps:

1. Send a message to the Kolide app on Slack. Choose **one** of the two options below:
   1. Paste the following command (in any message input field) in Slack: `/msg @Kolide installers`.
   2. Find the "Kolide" app within Slack and directly message it the word `installers` (case independent).
2. Follow Kolide's walk-through:

   1. Select `Enroll a Device`
   2. Select `Enroll your device`
   3. Select platform and wait for Kolide to create your installer.

3. Install the package created by Kolide in your chat with the app (named `xkxp-*-kolide-launcher.{pkg,msi,deb}`).
   There is _no_ success feedback given by Kolide in Slack.
   No error message means that the installation was successful.
4. Allow a couple of minutes to let Kolide check the state of your device, but if you're stuck at "Waiting for your device to connect" just go to the next step.
5. Check your devices status: `/msg @Kolide status` on Slack and fix errors if there are any.
6. Unless Kolide reports your device as "Ok"/"Healthy", follow the instructions on how to remediate the issues.

Go back to [macOS](#macos-installation), [Windows](#windows-installation) or [Ubuntu](#ubuntu-installation) installations to continue.

If a remediation required by Kolide makes you feel unsafe - feel free to ask in [#naisdevice](https://nav-it.slack.com/archives/C013XV66XHB) Slack channel.

### Connect naisdevice through task/sys -tray icon

![A macOS systray exemplifying a red-colored `naisdevice` icon.](../assets/naisdevice-systray-icon.svg)

When you have opened naisdevice, you may be concerned that nothing happened. The little naisdevice icon has appeared in your Systray (where all your small program icons are located - see above picture for how it looks on Mac):

1. Find your `naisdevice` icon (pictured above - though it should not be red at first attempted connection).
    - Can't find the icon? Make sure it is installed (See [macOS](#macos-installation), [Windows](#windows-installation) or [Ubuntu](#ubuntu-installation))
2. Left-click it and select `Connect`.
3. Read and accept the End-User terms and agreement ([The `Do's and Don'ts` of `naisdevice`](#how-to-accept-the-dos-and-donts-of-naisdevice)).
4. Left-click the `naisdevice` icon again and click `Connect`.
   You might need to allow ~20 seconds to pass before clicking `Connect` turns your `naisdevice` icon green.
5. If naisdevice gives a pop-up notification about your device being unhealthy, open Slack and find the Kolide app in the bottom left (scroll, scroll, scroll). Check if it still reports your device as healthy, or follow the steps Kolide suggests to make sure your device is secure. (The naisdevice systray-icon should have turned into a yellow color).

!!! tip
    If Kolide reports your device to be healthy, but still naisdevice won't let you connect, try to disconnect and re-connect `naisdevice`.

    If naisdevice still won't let you connect, be aware that it may take up to 5 minutes for the `naisdevice` server to register that Kolide now thinks your device is okay.

    If it still does not connect, we are always available to answer your questions in the [Slack channel #naisdevice](https://nav-it.slack.com/archives/C013XV66XHB).

### How to accept the "Do's and don'ts" of `naisdevice`

!!! info
    If you have not accepted the "Do's and don'ts", you will automatically be redirected to them when connecting to `naisdevice`.

1. Read through the list of "Do's and don'ts".
2. If you've got any questions, you may join the [Slack channel #naisdevice](https://nav-it.slack.com/archives/C013XV66XHB).
   _Which happens to be one of the required "Do's" anyway :wink:_
3. If you accept the terms (they are non-negotiable); click the green "Accept" button at the botttom of the page!
   The button should turn into a red "Reject" button once your acceptance has been processed!

### The list of "Do's and don'ts" of `naisdevice`

naisdevice removes the need for full blown management of your device.
This means that there are some do's and don'ts. You have to agree to the following set of guidelines to be admitted to the "program":

#### Do

- join [#naisdevice](https://nav-it.slack.com/archives/C013XV66XHB) on Slack as soon as possible 
- make sure that you have activated your screen lock, especially if running on Linux. And beware of apps that override, i.e. Caffeine/Amphetamine etc.
- your best to secure your device
- report any security shortcomings you discover
- ask the naisdevice team if in doubt

#### Don't

- enroll anything other than NAV owned devices.
- share your device with oothers. A naisdevice is a personal device.
- turn on sshd or similar services on your device.
- set up your device as a proxy. For anything!
- share network interfaces with virtual machines, meaning set them up as separate nodes on the network.
- take shortcuts
- move credentials off your device and transport them elsewhere

And otherwise: Just be nais.

### Connecting to NAIS clusters

1. In a terminal/shell of your choice, navigate to [kubeconfigs repo](https://github.com/navikt/kubeconfigs).
    1. If you haven't downloaded repo already: `git clone https://github.com/navikt/kubeconfigs.git`
    2. If you are using SSH keys, use this command instead: `git clone git@github.com:navikt/kubeconfigs.git`
2. `cd kubeconfigs` To navigate to the repository.
3. `git pull` To ensure you've got latest & greatest.
4. Make and set the `KUBECONFIG` environment variable to the path of the `config`-file.
    1. You can do this from the terminal with: `export KUBECONFIG="<path-to>/kubeconfigs/config"`
