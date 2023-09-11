# Installation for tenants

!!! info

    This install guide is for non-NAV employees only. If you are a NAV employee, or a consultant hired by NAV, install a [different version of naisdevice as described here](install.md).

## Device-specific installation steps

### macOS Installation

1. [Install Homebrew](https://brew.sh/) unless you already have it.

   Homebrew makes it possible to install and maintain apps using the terminal app on your Mac.

1. Open terminal (Use `<Command> + <Space>` to find `Terminal.app`) and add the nais tap by typing or pasting the text below and press `<Enter>`.

   Adding the nais tap lets Homebrew know where to get and update files from. Do not worry about where it will be installed, we got you covered.

   ```bash
   brew tap nais/tap
   ```

1. When the tap is added, you are ready to install naisdevice, by typing or pasting the following in terminal and press `<Enter>`.

   ```bash
   brew install naisdevice-tenant
   ```

1. You will be asked for your local device account's password to finish the installation.

1. Turn on your freshly installed `naisdevice` app.

   1. Use `<Command> + <Space>` to find your `naisdevice.app` and press `<Enter>`.
   1. Follow the [instructions to connect your _nais_ device](#connect-naisdevice-through-tasksys-tray-icon).

1. If you need to connect to anything running in K8s cluster, remember to [update your kubeconfig](https://docs.nais.io/device/install/#connecting-to-nais-clusters)

### Windows Installation

#### Install using Scoop

1. Install [Scoop](https://scoop.sh) unless you already have it.

   Scoop makes it possible to install and maintain programs from the command line.

1. Use the following command in the command line to add the nais bucket to let Scoop know where to get and update files from. Do not worry about where it will be installed, we got you covered.
   ```powershell
   scoop bucket add nais https://github.com/nais/scoop-bucket
   ```
1. When the bucket is added, you are ready to install naisdevice, by typing the following in the command line:
   ```powershell
   scoop install naisdevice-tenant
   ```
   (you will be asked for administrator access to run the installer)
1. If you need to connect to anything running in K8s cluster, remember to [update your kubeconfig](https://docs.nais.io/device/install/#connecting-to-nais-clusters)
1. Start _naisdevice_ from the _Start menu_

#### Manual installation

1. [Download and install naisdevice-tenant.exe](https://github.com/nais/device/releases/latest)
   (you will be asked for administrator access when you run the installer)
1. If you need to connect to anything running in K8s cluster, remember to [update your kubeconfig](https://docs.nais.io/device/install/#connecting-to-nais-clusters)
1. Start _naisdevice_ from the _Start menu_

### Ubuntu Installation

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
   ```
   sudo apt install naisdevice-tenant
   ```
1. Turn on your freshly installed `naisdevice` application.
   1. Find `naisdevice` in your application menu, or use the `naisdevice` command in a terminal to start the application.
   2. Follow the [instructions to connect your _nais_ device](#connect-naisdevice-through-tasksys-tray-icon).
1. Remember to [update your kubeconfig](install.md#connecting-to-nais-clusters).

### Connect naisdevice through task/sys -tray icon

![A macOS systray exemplifying a red-colored `naisdevice` icon.](../assets/naisdevice-systray-icon.svg)

When you have opened naisdevice, you may be concerned that nothing happened. The little naisdevice icon has appeared in your Systray (where all your small program icons are located - see above picture for how it looks on Mac):

1. Find your `naisdevice` icon (pictured above - though it should not be red at first attempted connection).
   - Can't find the icon? Make sure it is installed (See [macOS](#macos-installation), [Windows](#windows-installation) or [Ubuntu](#ubuntu-installation))
1. Left-click it and select `Connect`.
1. Left-click the `naisdevice` icon again and click `Connect`.
   You might need to allow ~20 seconds to pass before clicking `Connect` turns your `naisdevice` icon green.

### The list of "Do's and don'ts" of `naisdevice`

naisdevice removes the need for full blown management of your device.
This means that there are some do's and don'ts. You have to agree to the following set of guidelines to be admitted to the "program":

#### Do

- make sure that you have activated your screen lock, especially if running on Linux. And beware of apps that override, i.e. Caffeine/Amphetamine etc.
- your best to secure your device
- report any security shortcomings you discover
- ask the nais team if in doubt

#### Don't

- share your device with others. A naisdevice is a personal device.
- turn on sshd or similar services on your device.
- set up your device as a proxy. For anything!
- share network interfaces with virtual machines, meaning set them up as separate nodes on the network.
- take shortcuts
- move credentials off your device and transport them elsewhere

And otherwise: Just be nais.

### Connecting to NAIS clusters

1. Install `nais-cli` by following the [installation instructions](/cli/install.md).
1. Install `gcloud` by following the [installation instructions](https://cloud.google.com/sdk/docs/install).
1. Install `kubectl` by following the [installation instructions](https://kubernetes.io/docs/tasks/tools/install-kubectl/).
1. Login to gcloud by running `gcloud auth application-default login`.
1. Run `nais naas kubeconfig` to generate a kubeconfig for all NAIS clusters in the default directory (`~/.kube/config`).
   - If you want to generate the kubeconfig in a different directory, you can specify the environment variable `KUBECONFIG` to point to the desired location.
