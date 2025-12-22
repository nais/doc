---
tags: [naisdevice, how-to]
---

# Update naisdevice

=== "macOS"

    {% if tenant() == "nav" %}
    1. Request privileges by running `Privileges.app`
    {% endif %}
    1. Run the following command:
    ```bash
    brew update && brew upgrade <<naisdevice_name()>>
    ```

=== "Windows (Scoop)"

    1. Run the following command:
    ```powershell
    scoop update <<naisdevice_name()>>
    ```

=== "Windows (Manual)"

    1. Go to [github.com/nais/device](https://github.com/nais/device/releases/latest).
    2. Download and run the newest `<<naisdevice_name()>>.exe` installer.

=== "Ubuntu"

    1. Run the following command:
    ```bash
    apt install --only-upgrade <<naisdevice_name()>>
    ```
