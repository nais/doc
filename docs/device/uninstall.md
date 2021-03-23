# Uninstall

## OS-specific Uninstall steps

### macOS uninstall

1. Stop and remove Kolide and the related launch mechanisms

`sudo /bin/launchctl unload /Library/LaunchDaemons/com.kolide-k2.launcher.plist`
`sudo /bin/rm -f /Library/LaunchDaemons/com.kolide-k2.launcher.plist`

2. Delete files, configuration and binaries
`sudo /bin/rm -rf /usr/local/kolide-k2`
`sudo /bin/rm -rf /etc/kolide-k2`
`sudo /bin/rm -rf /var/kolide-k2`

### Windows uninstall

1. Enter  Apps & Features

2. Search for Kolide 

3. Click Uninstall 


### Ubuntu uninstall

1. Stop and remove Kolide and the related launch mechanisms

`systemctl stop launcher.kolide-k2`
`systemctl disable launcher.kolide-k2`

2. Uninstall program files
`dpkg --purge launcher-kolide-k2`

3. Delete files & caches
`rm -rf /var/kolide-k2 /etc/kolide-k2`


## OS-agnostic uninstall steps
When the program has been removed from your device let an admin know in [#naisdevice](https://nav-it.slack.com/archives/C013XV66XHB) Slack channel so it's record can be purged.



