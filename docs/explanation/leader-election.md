# Leader Election

With leader election it is possible to have one responsible pod.
This can be used to control that only one pod runs a batch-job or similar tasks.
This is done by asking the [elector container](https://github.com/nais/elector) which pod is the current leader, and comparing that to the pod's hostname.

The leader election configuration does not control which pod the external service requests will be routed to.

## Elector sidecar
When you [enable leader election](../how-to-guides/leader-election.md), NAIS will inject an elector container as a sidecar into your pod.

When you have the `elector` container running in your pod,
you can make a HTTP GET to the URL set in environment variable `$ELECTOR_PATH` to see which pod is the leader.
This will return a JSON object with the name of the leader,
which you can now compare with your hostname.

## Caveats

* A leader is elected for life. 
  When a leader is elected, it will continue to be the sole leader until the pod is deleted from the cluster.
  This remains the case even if the leader crashes, hangs, or is otherwise unable to make progress.
  The only way for a leader to lose leadership is to be deleted from the cluster.
  **We recommend that you create alerts to detect when your leader is not doing its job, so that you can intervene.**

* Participants in an election need to poll the `$ELECTOR_PATH` to be informed of changes in leadership.
  There is no push mechanism in place to inform your application about changes.
  This means your application needs to check at reasonable intervals for changes in leadership.
  NB: `$ELECTOR_PATH` is the raw ip string without the protocol i.e localhost:4040 so be aware
  of this and make sure to specify this in your http-client.
