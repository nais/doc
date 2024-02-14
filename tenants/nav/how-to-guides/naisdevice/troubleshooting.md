# Troubleshooting

- _naisdevice cannot connect, yet `/msg @Kolide status` is happy!_
    - Disconnect and re-connect `naisdevice` =\)!
- Kolide is reporting that your device has not been seen "in a long time"
    - Reinstall ([uninstall](uninstall.md) -> [install](install.md))
- Browser does not open after you click connect and naisdevice
    - Restart your default browser.
- Outgoing UDP connections to 51820/UDP must be open in your firewall and or modem provided by your ISP.
    - Try using hotspot to eliminate router config problems (remember to disconnect from WiFi on your hotspot device and make sure you use 4G/5G by checking https://www.ipaddress.my/)
- Fresh start
    - Stop naisdevice
    - Remove configuration directory
        - Mac: `rm -r "~/Library/Application Support/naisdevice/"`
        - Linux: `rm -r "~/.config/naisdevice/"`
        - Windows: `rmdir /s "C:\ProgramData\NAV\naisdevice\"`
    - Start naisdevice
