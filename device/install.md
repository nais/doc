# Installation of the naisdevice agent

## MacOS
1. [if you had navtunnel]: [uninstall navtunnel](#uninstall-navtunnel)
2. [install Kolide agent](#install-kolide-agent)
3. `curl https://device.nais.io/install.sh | bash` (you might be prompted for password)
4. Command+Space -> `naisdevice` -> systray icon -> connect ([allow ~20 seconds before filing issues](https://github.com/nais/device/issues/38))
5. Remember to [update your kubeconfig](#connecting-to-nais-clusters)

## Windows
1. [install Kolide agent](#install-kolide-agent)
2. [install WireGuard](https://www.wireguard.com/install/) (Note: Ignore error message regarding UI only being accessible by the Builtin Administrators group)
3. [install naisdevice](https://github.com/nais/device/releases/latest) (naisdevice.msi)
4. Remember to [update your kubeconfig](#connecting-to-nais-clusters)
5. Start _naisdevice_ from the _Start menu_ 

## Ubuntu
1. [install Kolide agent](#install-kolide-agent)
2. Install wireguard
	1. `sudo add-apt-repository ppa:wireguard/wireguard`
	2. `sudo apt install wireguard`
3. Clone repo: `git clone https://github.com/nais/device`
4. Make binaries: `cd device && make local`
5. Run agent: `./bin/device-agent`
6. Remember to [update your kubeconfig](#connecting-to-nais-clusters)

## Install Kolide agent
1. Slack: `/msg @Kolide installers`
2. Select platform and wait for Kolide to create your installer
3. Install package (xkxp-\*-kolide-launcher.{pkg,msi,deb,rpm}). There are no success feedback from the installer. No error message means that the installation was successful.
4. Allow a couple of minutes to let Kolide initialize device state, but if you're stuck at "Waiting for your device to connect" just go to the next step.
5. Check your devices status: `/msg @Kolide status` on Slack and fix errors if there are any


## Connecting to NAIS clusters
1. In a terminal/shell of your choice, navigate to [kubeconfigs repo](https://github.com/navikt/kubeconfigs)'.
   1. If you haven't downloaded repo already: `git clone <clone URL> && cd kubeconfigs`
2. `git pull` To ensure you've got latest & greatest.
3. `git checkout naisdevice` Remember to use the right branch!

## Uninstall navtunnel
* Remove proxy settings from MAVEN_OPTS and Maven settings.xml
* Remove Navtunnel settings from .ssh/config and .ssh/config.d

### MacOS
1. `sudo sed -i -e '/\# NAV MANAGED/,/\# END NAV MANAGED/d' /private/etc/hosts`
2. `sudo rm -rf "/Applications/navtunnel.app"`
3. `sudo rm -rf "/Applications/ScaleFT.app"`
4. `networksetup -setautoproxystate "Wi-Fi" off`

### Windows
1. Remove Navtunnel-entries from c:\windows\system32\drivers\etc\hosts
2. Remove proxy settings from you browser

## FAQ
* _naisdevice cannot connect, yet `/msg @Kolide status` is happy!_
	* Disconnect and re-connect `naisdevice`-agent =)!
