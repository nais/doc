# Updating naisdevice

These instructions assume that you already have some version of naisdevice installed, and that you are already familiar with the general method of use.
If this is not the case, head over to the [installation instructions](./install.md).

## OS-specific update instructions

### macOS

If you don't already have naisdevice installed via Homebrew, refer to [installation instructions](./install.md).

To update:

1. Request privileges by running `Privileges.app` 
2. Open a Terminal window.
3. Run the following command:

```bash
brew update && brew upgrade naisdevice
```

### Windows

#### If you installed using scoop

```powershell
scoop update naisdevice
```

#### Manual installation

Download and run the newest [naisdevice installer](https://github.com/nais/device/releases/latest) \(naisdevice.exe\).

### Ubuntu \(using Gnome DE - only supported variant atm\)

Use the [standard mechanisms  provided by APT](https://ubuntu.com/server/docs/package-management) to upgrade the `naisdevice` package

## Troubleshooting

If your attempt at updating naisdevice at any point fails, refer to the [installation instructions](./install.md) and follow the instructions for your operating system from the point after "Install Kolide agent".
If you still experience issues after trying that, hit us up in the [#naisdevice](https://nav-it.slack.com/archives/C013XV66XHB) channel on Slack.
