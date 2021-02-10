# Installation

## OS-specific installation steps

### macOS Installation

1. If you have got __`navtunnel`__ installed -> [uninstall navtunnel](#uninstall-navtunnel).
2. [Install the Kolide agent](#install-kolide-agent).
3. Write in the terminal: `curl https://device.nais.io/install.sh | bash` \(you might be prompted for your laptop-account's password to unlock `sudo`\).
4. Turn on your freshly installed `naisdevice` app.
    1. Use &lt;Command&gt; + &lt;Space&gt; to find your `naisdevice.app` and press &lt;Enter&gt;.
    2. Follow the [instructions to connect your _nais_ device](#connect-naisdevice-through-tasksys-tray-icon).
5. Remember to [update your kubeconfig](#connecting-to-nais-clusters) if you need to connect to anything running in a K8s cluster.

### Windows Installation

1. [install Kolide agent](install.md#install-kolide-agent)
2. [install WireGuard](https://www.wireguard.com/install/) \(Note: Ignore error message regarding UI only being accessible by the Builtin Administrators group\)
3. [install naisdevice](https://github.com/nais/device/releases/latest) \(naisdevice.msi\)
4. Remember to [update your kubeconfig](install.md#connecting-to-nais-clusters)
5. Start _naisdevice_ from the _Start menu_ 

### Ubuntu Installation

Using Gnome DE - only supported variant atm

1. [Install Kolide agent](install.md#install-kolide-agent).
2. Write in the terminal: `curl https://device.nais.io/install.sh | bash` \(you might be prompted for your laptop-account's password to unlock `sudo`\).
3. Turn on your freshly installed `naisdevice` application.
    1. Find `naisdevice` in your application menu, or use the `naisdevice` command in a terminal to start the application.
    2. Follow the [instructions to connect your _nais_ device](#connect-naisdevice-through-tasksys-tray-icon).
4. Remember to [update your kubeconfig](install.md#connecting-to-nais-clusters).

## OS-agnostic install steps
###  Install Kolide agent

1. Send a message to the Kolide app on Slack, either by:
    1. Pasting the following command (in any message input field) in Slack: `/msg @Kolide installers` or by,
    2. finding the "Kolide" app and directly messaging it `installers`.
2. Follow Kolide's walk-through:
    1. Select `Enroll a Device`
    2. Select `Enroll your device`
    3. Select `My employer owns this device` (`naisdevice` is currently _**not**_ supported on private devices).
    4. Select platform and wait for Kolide to create your installer.
3. Install the package created by Kolide in your chat with the app (named `xkxp-*-kolide-launcher.{pkg,msi,deb,rpm}`).
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
    1. If not your device is not healthy - remediate the issues.
    2. If your device is healthy - try to disconnect and re-connect `naisdevice` through the menu given by clicking the icon on the systray.

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
    1. If you haven't downloaded repo already: `git clone https://github.com/navikt/kubeconfigs.git && cd kubeconfigs`
2. `git pull` To ensure you've got latest & greatest.
3. Make and set the `KUBECONFIG` environment variable to the path of the `config`-file.
    1. You can do this from the terminal with: `export KUBECONFIG="<path-to>/kubeconfigs/config"`

## Uninstall navtunnel

### For your existing applications

!!! info
    The below application-specific instructions are only relevant if you've got the applications installed.
    If you don't use them in your daily work, they're most likely not installed.

#### Maven

* Remove proxy settings from MAVEN\_OPTS and Maven settings.xml

#### SSH

* Remove Navtunnel settings from .ssh/config and .ssh/config.d

### macOS

!!! info
    The below commands should be safe to run as-is.
    The terminal will reply with "Insufficient access"-like error messages if you lack sufficient privileges.
    Try them one by one.

Run the below commands in a terminal.

1. `sudo sed -i -e '/\# NAV MANAGED/,/\# END NAV MANAGED/d' /private/etc/hosts && echo -e '\n\t*sed* command executed successfully!'`
2. `sudo rm -rf "/Applications/navtunnel.app" && echo -e '\n\t*navtunnel* app deleted sucessfully!'`
3. `sudo rm -rf "/Applications/ScaleFT.app" && echo -e '\n\t*ScaleFT* deleted successfully!'`
4. `networksetup -setautoproxystate "Wi-Fi" off && echo -e '\n\t*Wi-Fi* Wi-Fi proxying turned off successfully!'`

Questions you might have after having attempted to execute any of these commands may be asked in the [#naisdevice](https://nav-it.slack.com/archives/C013XV66XHB) Slach channel.

### Windows

1. Remove Navtunnel-entries from c:\windows\system32\drivers\etc\hosts
2. Remove proxy settings from your browser
