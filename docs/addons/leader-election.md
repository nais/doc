# Leader Election

With leader election it is possible to have one responsible pod.
This can be used to control that only one pod runs a batch-job or similar tasks.
This is done by asking the `elector` container which pod is the current leader, and comparing that to the pod's hostname.

The leader election configuration does not control which pod the external service requests will be routed to.

## Enable leader election

Enabling leader election in a pod is done by adding the line `leaderElection: true` to your `nais.yaml`-file.
With that setting enabled, NAIS will sidecar an elector container into your pod.

When you have the `elector` container running in your pod,
you can make a HTTP GET to the URL set in environment variable `$ELECTOR_PATH` to see which pod is the leader.
This will return a JSON object with the name of the leader,
which you can now compare with your hostname.

## Issues

We changed leader election implementation in January 2022.
The old implementation had some issues, which we have attempted to address.
In doing so, we have made other trade-offs, which results in these issues:

* A leader is elected for life. 
  When a leader is elected, it will continue to be the sole leader until the pod is deleted from the cluster.
  This remains the case even if the leader crashes, hangs, or is otherwise unable to make progress.
  The only way for a leader to lose leadership is to be deleted from the cluster.
  **We recommend that you create alerts to detect when your leader is not doing its job, so that you can intervene.**

* Participants in an election need to poll the `$ELECTOR_PATH` to be informed of changes in leadership.
  There is no push mechanism in place to inform your application about changes.
  This means your application needs to check at reasonable intervals for changes in leadership.
  (This was also the case in the old implementation).


## Examples

### Java example

```java
// Implementation of getJSONFromUrl is left as an exercise for the reader
class Leader {
    public static boolean isLeader() {
        String electorPath = System.getenv("ELECTOR_PATH");
        JSONObject leaderJson = getJSONFromUrl(electorPath);
        String leader = leaderJson.getString("name");
        String hostname = InetAddress.getLocalHost().getHostname();

        return hostname.equals(leader);
    }
}
```

### cURL example

```bash
$ kubectl exec -it elector-sidecar-755b7c5795-7k2qn -c debug bash
root@elector-sidecar-755b7c5795-7k2qn:/# curl $ELECTOR_PATH
{"name":"elector-sidecar-755b7c5795-2kcm7"}
```
