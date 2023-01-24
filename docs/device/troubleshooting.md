# Troubleshooting

- _naisdevice cannot connect, yet `/msg @Kolide status` is happy!_
  - Disconnect and re-connect `naisdevice`-agent =\)!
- Outgoing UDP connections to 51820/UDP must be open in your firewall and or modem provided by your ISP.
  - Try using hotspot to eliminate router config problems (remember to disconnect from WiFi on your hotspot device and make sure you use 4G/5G by checking https://www.ipaddress.my/)
- If Kolide is reporting that your device has not been seen "in a long time" try reinstalling. [Uninstall](uninstall.md)
- If a browser does not pop up after you click connect and naisdevice is stuck authenticating, restart your default browser.
- Try a fresh start
  - stop naisdevice
    - mac: `rm -r "~/Library/Application Support/naisdevice/"`
    - linux: `rm -r "~/.config/naisdevice/"`
    - windows: `rmdir /s "C:\ProgramData\NAV\naisdevice\"`
  - start naisdevice
