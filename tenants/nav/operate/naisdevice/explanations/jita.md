---
tags: [naisdevice, jita, explanation]
---

# Just In Time Access (JITA)

## Providing access to sensitive information

When you start naisdevice you will not be automatically connected to all the available gateways. In order to reach some of the services you will need to request "just in time access". The purpose of this mechanism is to provide temporary access to selected production environments through self service while keeping an audit trail. JITA requires authentication through the Microsoft login portal.

!!! info
    The gateways currently requiring JITA are `aiven-prod`, `onprem-k8s-prod` and `postgres-prod`.

    Access can be requested via the naisdevice menu or through the [nais cli](../../cli/reference/device.md#jita).

Once authenticated you will be presented with a form where you have to supply a short reason for why access is needed and for how long. You will then be granted access for the requested amount of time instantly and automatically.

![A screenshot that shows the part of the form, where you supply the short reason for why access is needed and for how long. The label of the input field is "Reason". A slider below allows you to select the duraction.](../../../assets/jita_portal.png)
