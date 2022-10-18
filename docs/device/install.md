# Installation

## OS-specific installation steps

### macOS Installation

1. [Install the Kolide agent](#install-kolide-agent).
2. Install [Homebrew](https://brew.sh/) unless you already have it.
3. Add the nais tap
    ```bash
    brew tap nais/tap
    ```
4. Install the naisdevice cask:
    ```bash
    brew install naisdevice
    ``` 
   (you will be prompted for your laptop-account's password to unlock `sudo`).
5. Turn on your freshly installed `naisdevice` app.
    1. Use &lt;Command&gt; + &lt;Space&gt; to find your `naisdevice.app` and press &lt;Enter&gt;.
    2. Follow the [instructions to connect your _nais_ device](#connect-naisdevice-through-tasksys-tray-icon).
6. Remember to [update your kubeconfig](#connecting-to-nais-clusters) if you need to connect to anything running in a K8s cluster.

### Windows Installation

#### Install using Scoop

1. [install Kolide agent](install.md#install-kolide-agent)
2. Install [Scoop](https://scoop.sh) unless you already have it.
3. Add the nais bucket
   ```powershell
   scoop bucket add nais https://github.com/nais/scoop-bucket
   ```
4. Install naisdevice
   ```powershell
   scoop install naisdevice
   ```
   (you will be prompted for administrator access to run the installer)
5. Remember to [update your kubeconfig](install.md#connecting-to-nais-clusters)
6. Start _naisdevice_ from the _Start menu_

#### Manual installation

1. [install Kolide agent](install.md#install-kolide-agent)
2. [install naisdevice](https://github.com/nais/device/releases/latest) \(naisdevice.exe\)
   (you will be prompted for administrator access when you run the installer)
3. Remember to [update your kubeconfig](install.md#connecting-to-nais-clusters)
4. Start _naisdevice_ from the _Start menu_ 

### Ubuntu Installation

!!! warn
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

## OS-agnostic install steps

### Install Kolide agent

1. Send a message to the Kolide app on Slack, either by:
    1. Pasting the following command (in any message input field) in Slack: `/msg @Kolide installers` or by,
    2. finding the "Kolide" app and directly messaging it the word `installers` (case independent).
2. Follow Kolide's walk-through:

    1. Select `Enroll a Device`
    2. Select `Enroll your device`
    3. Select platform and wait for Kolide to create your installer.

3. Install the package created by Kolide in your chat with the app (named `xkxp-*-kolide-launcher.{pkg,msi,deb}`).
   There are is _no_ success feedback given by Kolide in Slack.
   No error message means that the installation was successful.
4. Allow a couple of minutes to let Kolide initialize device state, but if you're stuck at "Waiting for your device to connect" just go to the next step.
5. Check your devices status: `/msg @Kolide status` on Slack and fix errors if there are any.
6. Unless Kolide reports your device as "Ok"/"Healthy", follow the instructions on how to remediate the issues.

Go back to [macOS](#macos-installation), [Windows](#windows-installation) or [Ubuntu](#ubuntu-installation) installations to continue.

!!! warning
    The issues reported by Kolide _**must**_ be addressed - these remediations have been vetted by the NAIS team and should be followed.
    Depending on the issue, you might lose `naisdevice` connectivity if an issue is left unresolved for a sufficient length of time.

    If a remediation required by Kolide makes you feel unsafe - feel free to ask in [#naisdevice](https://nav-it.slack.com/archives/C013XV66XHB) Slack channel.

### Connect naisdevice through task/sys -tray icon

![A macOS systray exemplifying a red-colored `naisdevice` icon.](../assets/naisdevice-systray-icon.svg)

In your Systray (where all your small program icons are located - see above picture for how it looks on Mac):

1. Find your `naisdevice` icon (pictured above - though it should not be red at first attempted connection).
    - Can't find the icon? Make sure it is installed (See [macOS](#macos-installation), [Windows](#windows-installation) or [Ubuntu](#ubuntu-installation))
2. Left-click it and select `Connect`.
3. Read and accept the End-User terms and agreement (The `Do's and Don'ts` of `naisdevice`).
   See the [picture below](#how-to-accept-the-dos-and-donts-of-naisdevice).
4. Left-click the `naisdevice` icon again and click `Connect`.
   You might need to allow ~20 seconds to pass before clicking `Connect` turns your `naisdevice` icon green.
5. If `naisdevice` gives a pop-up notification about your device being unhealthy - double check that Kolide still reports your device as healthy.
   (The `naisdevice` systray-icon should have turned into a yellow color).
    - If not your device is not healthy - remediate the issues.

!!! tip
    If Kolide reports your device to be healthy, but still naisdevice won't let you connect, try to disconnect and re-connect `naisdevice`.

    If naisdevice still won't let you connect, be aware that it may take up to 5 minutes for the `naisdevice` server to register that Kolide now thinks your device is okay.

### How to accept the "Do's and don'ts" of `naisdevice`

!!! info
    You should be automatically sent here when connecting to `naisdevice` if not you've not yet accepted.
    Can manually be found at the following URL: [https://naisdevice-approval.nais.io/](https://naisdevice-approval.nais.io/).

![An example screenshot of the `naisdevice` Do's and Don'ts](../assets/naisdevice-dos-and-donts.svg)

1. Read through the list of "Do's and don'ts".
2. If you've got any questions, you may join the [#naisdevice](https://nav-it.slack.com/archives/C013XV66XHB) Slack channel.
   _Which happens to be one of the required "Do's" anyways ;)_.
3. If you accept the terms (they are non-negotiable); click the green "Accept" button at the botttom of the page!
   The button should turn into a red "Reject" button once your acceptance has been processed!

### Connecting to NAIS clusters

1. In a terminal/shell of your choice, navigate to [kubeconfigs repo](https://github.com/navikt/kubeconfigs).
    1. If you haven't downloaded repo already: `git clone https://github.com/navikt/kubeconfigs.git`
    2. If you are using SSH keys, use this command instead: `git clone git@github.com:navikt/kubeconfigs.git`
2. `cd kubeconfigs` To navigate to the repository.
3. `git pull` To ensure you've got latest & greatest.
4. Make and set the `KUBECONFIG` environment variable to the path of the `config`-file.
    1. You can do this from the terminal with: `export KUBECONFIG="<path-to>/kubeconfigs/config"`
