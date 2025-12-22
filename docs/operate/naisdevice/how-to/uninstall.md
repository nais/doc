---
tags: [naisdevice, how-to]
---

# Uninstall naisdevice

=== "macOS"

    {% if tenant() == "nav" %}
    1. Click deregister in the menu (three dots) for the device you want to deregister [here](https://app.kolide.com/1401/my/devices) (login required)
    1. Follow recommended method for your OS [here](https://www.kolide.com/docs/admins/agent/removal-instructions#macos).
    {% endif %}
    1. Run the following command:
    ```bash
    brew uninstall --force <<naisdevice_name()>>
    ```

=== "Windows (Scoop)"

    {% if tenant() == "nav" %}
    1. Click deregister in the menu (three dots) for the device you want to deregister [here](https://app.kolide.com/1401/my/devices) (login required)
    1. Follow recommended method for your OS [here](https://www.kolide.com/docs/admins/agent/removal-instructions#windows).
    {% endif %}
    1. (Optionally) Uninstall _WireGuard_ from Apps & Features.
    1. Uninstall naisdevice.
    ```powershell
    scoop uninstall <<naisdevice_name()>>
    ```

=== "Windows (Manual)"

    {% if tenant() == "nav" %}
    1. Click deregister in the menu (three dots) for the device you want to deregister [here](https://app.kolide.com/1401/my/devices) (login required)
    1. Follow recommended method for your OS [here](https://www.kolide.com/docs/admins/agent/removal-instructions#windows).
    {% endif %}
    1. (Optionally) Uninstall _WireGuard_ from Apps & Features.
    1. Uninstall `<<naisdevice_name()>>.exe` from Apps & Features.

=== "Ubuntu"

    {% if tenant() == "nav" %}
    1. Click deregister in the menu (three dots) for the device you want to deregister [here](https://app.kolide.com/1401/my/devices) (login required)
    1. Follow recommended method for your OS [here](https://www.kolide.com/docs/admins/agent/removal-instructions#linux).
    {% endif %}
    1. Run the following command:
    ```bash
    sudo apt purge <<naisdevice_name()>>
    ```
