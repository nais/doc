---
tags: [naisdevice, how-to]
---

# Update naisdevice

=== "macOS"

    1. Request privileges by running `Privileges.app`
    2. Open a Terminal window.
    3. Run the following command:

    {% if tenant() == "nav" %}

    ```bash
    brew update && brew upgrade naisdevice
    ```
    {% else %}

    ```bash
    brew update && brew upgrade naisdevice-tenant
    ```

    {% endif %}

=== "Windows (Scoop)"

    {% if tenant() == "nav" %}

    ```powershell
    scoop update naisdevice
    ```

    {% else %}

    ```powershell
    scoop update naisdevice-tenant
    ```

    {% endif %}

=== "Windows (Manual)"

    {% if tenant() == "nav" %}

    Download and run the newest [naisdevice installer](https://github.com/nais/device/releases/latest) \(naisdevice.exe\).

    {% else %}

    Download and run the newest [naisdevice installer](https://github.com/nais/device/releases/latest) \(naisdevice-tenant.exe\).

    {% endif %}

=== "Ubuntu"

    1. Open a Terminal window.
    2. Run the following command:

    {% if tenant() == "nav" %}

    ```shell
    apt-get install --only-upgrade naisdevice
    ```

    {% else %}

    ```shell
    apt-get install --only-upgrade naisdevice-tenant
    ```

    {% endif %}
