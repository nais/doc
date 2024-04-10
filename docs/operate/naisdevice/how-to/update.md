---
tags: [naisdevice, how-to]
---

# Updating naisdevice

=== "macOS"

    1. Request privileges by running `Privileges.app` 
    2. Open a Terminal window.
    3. Run the following command:

    ```bash
    brew update && brew upgrade naisdevice
    ```

=== "Windows"

    ### If you installed using scoop
    ```powershell
    scoop update naisdevice
    ```
    ### Manual installation
    Download and run the newest [naisdevice installer](https://github.com/nais/device/releases/latest) \(naisdevice.exe\).

=== "Ubuntu"
    1. Open a Terminal window.
    2. Run the following command:
    
    ```shell
    apt-get install --only-upgrade naisdevice
    ```
