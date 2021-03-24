# Troubleshooting

* _naisdevice cannot connect, yet `/msg @Kolide status` is happy!_
  * Disconnect and re-connect `naisdevice`-agent =\)!
* If you used MacOS migrate assistant, remove your old config `rm -r "~/Library/Application Support/naisdevice"` before you start naisdevice.
* Outgoing UDP connections to 51820/UDP must be open in your firewall and or modem provided by your ISP.
* If Kolide is reporting that your device has not been seen "in a long time" try reinstalling. [Uninstall](uninstall.md)
