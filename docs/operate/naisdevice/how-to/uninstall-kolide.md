---
tags: [naisdevice, how-to]
conditional: [tenant, nav]
---

# Uninstall Kolide

=== "macOS"
    1. Stop and remove Kolide and the related launch mechanisms
    ```bash
    sudo /bin/launchctl unload /Library/LaunchDaemons/com.kolide-k2.launcher.plist
    sudo /bin/rm -f /Library/LaunchDaemons/com.kolide-k2.launcher.plist
    ```
    2. Delete files, configuration and binaries
    ```bash
    sudo /bin/rm -rf /usr/local/kolide-k2
    sudo /bin/rm -rf /etc/kolide-k2
    sudo /bin/rm -rf /var/kolide-k2
    ```

=== "Windows"
    1. Uninstall _Kolide_ from Apps & Features 
    2. Depending on agent version installed, the uninstall will leave the prior launcher database in either `C:\Program Files\Kolide\Launcher-kolide-k2` or `C:\ProgramData\Kolide\Launcher-kolide-k2`. For a complete removal, these directories can be deleted through Windows Explorer or from an Admin PowerShell window with the following commands:

    - `Remove-Item -LiteralPath "C:\Program Files\Kolide\Launcher-kolide-k2" -Force -Recurse`
    - `Remove-Item -LiteralPath "C:\ProgramData\Kolide\Launcher-kolide-k2" -Force -Recurse`

    3. (Optionally) Uninstall _WireGuard_ from Apps & Features

=== "Ubuntu"
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

## OS-agnostic uninstall steps

When the program has been removed from your device, let an admin know in [#naisdevice](https://nav-it.slack.com/archives/C013XV66XHB) Slack channel. 
This is necessary so that the record of your device can be purged from our Kolide systems. Autoremoval will occur after 29 days.
