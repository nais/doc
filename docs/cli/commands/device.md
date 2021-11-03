# device command

!!! info "MVP"
    The `device` command is very fresh, and only has a small subset of functions compared to [naisdevice](../../../device).

The device command can be used to connect to, disconnect from, and view the connection status of [naisdevice](../../../device).
Currently, the command requires the processes `naisdevice-agent` and `naisdevice-helper` to run, both of which can be run by starting naisdevice.

## connect

Requests a connection and waits for success.
The expected output is "Connected", or nothing if the device is already connected.

```bash
nais device connect
```

## disconnect

Requests a disconnection and waits for success.
The expected output is "Disconnected", or nothing if the device is already disconnected.

```bash
nais device disconnect
```

## status

Prints the connection status of `naisdevice-agent`. 
Typically, the status will be either "Connected" or "Disconnected".

```bash
nais device status
```

