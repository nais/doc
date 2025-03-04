---
tags: [leader-election, sidecar, explanation, services]
---

# Leader Election

With leader election it is possible to have one responsible pod.
This can be used to control that only one pod runs a batch-job or similar tasks.
This is done by asking the [elector container](https://github.com/nais/elector) which pod is the current leader, and comparing that to the pod's hostname.

The leader election configuration does not control which pod the external service requests will be routed to.

## Elector sidecar

When you [enable leader election](how-to/enable.md), Nais will inject an elector container as a sidecar into your pod.

### Simple API

The environment variable `$ELECTOR_GET_URL` contains a URL that can be used to `GET` the current leader.
Previously, the environment variable `$ELECTOR_PATH`[^1] was used for this API, and it is still available for backwards compatibility.

The simple API returns a JSON object with the name of the leader, which you can now compare with your hostname.

[^1]: Contains only hostname and port, without the protocol. E.g. `localhost:4040`.

### Server Sent Events API

The environment variable `$ELECTOR_SSE_URL` contains a URL that can be used to subscribe to leadership changes using Server Sent Events.

This will emit an event whenever there are changes to leadership, and you can use this to update your application accordingly.

## Caveats

* A leader is elected for life. 
  When a leader is elected, it will continue to be the sole leader until the pod is deleted from the cluster.
  This remains the case even if the leader crashes, hangs, or is otherwise unable to make progress.
  The only way for a leader to lose leadership is to be deleted from the cluster.
  **We recommend that you create alerts to detect when your leader is not doing its job, so that you can intervene.**

* When using the simple API the application needs to poll the API at regular intervals to be informed of changes in leadership.
  This means your application needs to check at reasonable intervals for changes in leadership.
