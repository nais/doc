---
tags: [naisdevice, how-to]
---

# Install Kolide

### How to Install Kolide agent

The Kolide agent will be added to your Slack app, and let you know when there are recommended updates or security issues you need to address - and how to address them. Slack apps are located in the bottom left corner of your Slack app.

You install Kolide by following these steps:

1. Send a message to the Kolide app on Slack. Choose **one** of the two options below:
    1. Paste the following command (in any message input field) in Slack:
       ```
       /msg @Kolide installers
       ```
    2. Find the "Kolide" app within Slack and directly message it the word `installers` (case independent)
2. Follow Kolide's walk-through:
    1. Select `Enroll a Device`
    2. Select `Enroll your device`
    3. Select platform and wait for Kolide to create your installer.
3. Install the package created by Kolide in your chat with the app (named `xkxp-*-kolide-launcher.{pkg,msi,deb}`).
    - There is _no_ success feedback given by Kolide in Slack.
    - No error message means that the installation was successful.
4. Allow a couple of minutes to let Kolide check the state of your device, but if you're stuck at "Waiting for your device to connect" just go to the next step.
5. Check your devices status:
    1. Paste the following command (in any message input field) in Slack:
       ```
       /msg @Kolide status
       ```
6. If Kolide reports any issues, follow the instructions on how to remediate them. If a remediation required by Kolide makes you feel unsafe - feel free to ask in [#naisdevice Slack channel](https://nav-it.slack.com/archives/C013XV66XHB). (TODO)

!!! warning

    The issues reported by Kolide _**must**_ be addressed - these remediations have been vetted by the NAIS team and should be followed. Depending on the issue, you might lose `naisdevice` connectivity if an issue is left unresolved for a sufficient length of time.

    If you run into problems, you can always ask in the [Slack channel #naisdevice](https://nav-it.slack.com/archives/C013XV66XHB)
