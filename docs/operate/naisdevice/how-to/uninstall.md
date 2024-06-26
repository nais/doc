---
tags: [naisdevice, how-to]
---

# Uninstall naisdevice

## OS-specific Uninstall steps

{% if tenant() == "nav" %}

### macOS uninstall

1. Stop and remove Kolide and the related launch mechanisms
    ```zsh
    sudo /bin/launchctl unload /Library/LaunchDaemons/com.kolide-k2.launcher.plist
    sudo /bin/rm -f /Library/LaunchDaemons/com.kolide-k2.launcher.plist
    ```
2. Delete files, configuration and binaries
    ```zsh
    sudo /bin/rm -rf /usr/local/kolide-k2
    sudo /bin/rm -rf /etc/kolide-k2
    sudo /bin/rm -rf /var/kolide-k2
    ```
3. Uninstall the naisdevice Homebrew cask
    ```bash
    brew uninstall --force naisdevice
    ```

### Windows uninstall

1. Uninstall _Kolide_ from Apps & Features 
2. (Optionally) Uninstall _WireGuard_ from Apps & Features
3. Uninstall naisdevice
   * Installed with Scoop
     ```powershell
     scoop uninstall naisdevice
     ```
   * Installed manually
     * Uninstall _naisdevice_ from Apps & Features

### Ubuntu uninstall

1. Stop and remove Kolide and the related launch mechanisms
    ```bash
    sudo systemctl stop launcher.kolide-k2.service
    sudo systemctl disable launcher.kolide-k2.service
    ```
2. Uninstall Kolide program files
    ```bash
    sudo apt(-get) remove launcher-kolide-k2
    ```
3. Delete Kolide files & caches
    ```bash
    sudo rm -r /{etc,var}/kolide-k2
    ```
4. Uninstall the naisdevice deb package
    ```bash
    sudo apt remove naisdevice
    ```

## OS-agnostic uninstall steps

When the program has been removed from your device, let an admin know in [#naisdevice](https://nav-it.slack.com/archives/C013XV66XHB) Slack channel.
This is necessary so that the record of your device can be purged from our Kolide systems.

{% else %}

### macOS uninstall

Uninstall the naisdevice Homebrew cask

```bash
brew uninstall --force naisdevice
```

### Windows uninstall

1. (Optionally) Uninstall _WireGuard_ from Apps & Features
2. Uninstall naisdevice
    * Installed with Scoop
      ```powershell
      scoop uninstall naisdevice
      ```
    * Installed manually
        * Uninstall _naisdevice_ from Apps & Features

### Ubuntu uninstall

Uninstall the naisdevice deb package

```bash
sudo apt remove naisdevice
```

{% endif %}
