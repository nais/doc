# Installation

## Install Kolide agent
1. Slack: `/msg @Kolide installers`
2. Select platform and wait for Kolide to create your installer
3. Install package (xkxp-\*-kolide-launcher.{pkg,msi,deb,rpm})
4. Wait a couple of minutes to let Kolide initialize device state
5. Check your devices status: `/msg @Kolide status` and fix errors if there are any

## Install naisdevice agent
#### MacOS 
1. [if you had navtunnel]: [uninstall navtunnel](#uninstall-navtunnel)
2. [install Kolide agent](#install-kolide-agent)
3. `curl https://device.nais.io/install.sh | bash` (you might be prompted for password)
4. Command+Space -> `naisdevice` -> systray icon -> connect ([allow ~20 seconds before filing issues](https://github.com/nais/device/issues/38))

#### Windows
1. [install Kolide agent](#install-kolide-agent)
2. Download and install [WireGuard](https://www.wireguard.com/install/)
3. Download `device-agent.exe` and `device-agent-helper.exe` [latest naisdevice release](https://github.com/nais/device/releases/latest)
4. Optional: place files in a directory for easier access
5. Launch `cmd.exe`
6. go to dir with exe files and run `device-agent-helper.exe --config-dir "%appdata%\naisdevice" --install`
7. run `device-agent.exe`

#### Linux
1. [install Kolide agent](#install-kolide-agent)
2. Install wireguard
	1. `sudo add-apt-repository ppa:wireguard/wireguard`
	2. `sudo apt install wireguard`
3. Clone repo: `git clone https://github.com/nais/device`
4. Make binaries: `cd device && make local`
5. Run agent: `./bin/device-agent`

# Connecting to NAIS clusters
1. in kubeconfigs repo: `git pull && git checkout naisdevice`

# Uninstall navtunnel
1. `sudo sed -i -e '/\# NAV MANAGED/,/\# END NAV MANAGED/d' /private/etc/hosts`
2. `sudo rm -rf "/Applications/navtunnel.app"`
3. `networksetup -setautoproxystate "Wi-Fi" off`
