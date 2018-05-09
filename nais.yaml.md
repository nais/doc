# Nais.yaml

This file contains the configuration of your nais application. It must reside within the git repository together with your source code.

The main documentation for the content of this file is found here: https://github.com/nais/naisd/blob/master/nais_example.yaml


## Leader election

With leader election you can have one responsible pod. This can be used to control that only one pod runs a batch-job or similar tasks. This is done by asking the `elector` pod which pod is the current leader, and comparing that to the pods hostname.

The leader election configuration does not control which pod the external service requests will be routed to.


### Enable leader election

Enabling leader election in your pod is done by adding the line `leaderElection: true` to your `nais.yaml`-file. With that setting, `naisd` will sidecar an elector container into your pod.

When you have the `elector` container running in your pod, you can run a HTTP GET on the URL set in environment variable `$ELECTOR_PATH` to see which pod is the leader. This will return a json with the name of the leader, which you can now compare with your hostname.


#### Code example

```java
// Implementation of getJSONFromUrl is left as an exercise for the reader
public boolean isLeader() {
    String electorPath = System.getenv("ELECTOR_PATH");
    JSONObject leaderJson = getJSONFromUrl(electorPath);
    String leader = leaderJson.getString("name");
    String hostname = InetAddress.getLocalHost().getHostname();

    return leader == hostname;
}
```


#### cURL example

```bash
$ kubectl exec -it elector-sidecar-755b7c5795-7k2qn -c debug bash
root@elector-sidecar-755b7c5795-7k2qn:/# curl $ELECTOR_PATH
{"name":"elector-sidecar-755b7c5795-2kcm7"}
```


### Issues
* This is not really an issue with Nais but: *Kubernetes' `leader-election`-image does not support fencing, which means it does not guarantee there is only one leader*. Since Nais keeps the date and time in the pods syncronized this is not an issue. There will always be only one leader.
* Redeploy of the deployment/pods will sometime make the non-leaders believe that the old leader still exists and is the leader. The current leader is not affected, and will be aware that the pod itself is the leader. This is not really an issue as long as you do not need to know exactly which pod is the leader. This can be resolved by deleting pods with erroneous leader election configuration.


## Redis

By setting this value to `true`, naisd will start a small cluster of pods with Redis masters and sentinels. For now we are running Redis without disk, so a restart of the Redis cluster will terminate your data. So don't store data that you can't afford to lose. Good use cases for this cluster is to store SQL queries that are asked a lot, bad use case is to store user config, or drafts of user inputs. The Redis cluster is also available for all the other applicaiton running in the same K8s cluster as your application.

Read more about Redis sentinels over at [redis.io](https://redis.io/topics/sentinel). Remember that your Redis framework needs to be [sentinel-ready](https://redis.io/topics/sentinel-clients).

Your specific sentinels can be reach with the following values:
```
url: rfs-<NAME>
port: 26379
master-name: mymaster
```


### Code example

Example below is using [Jedis](https://github.com/xetorthio/jedis).

```java
public class JedisTestSentinelEndpoint {
    private static final String MASTER_NAME = "mymaster";
    private static final Set sentinels;

    public JedisTestSentinelEndpoint(String appname) {
        this.sentinels = new HashSet();
	this.sentinels.add("rfs-" + appname + ":26379");
    }

    private void runTest() throws InterruptedException {
        JedisSentinelPool pool = new JedisSentinelPool(MASTER_NAME, sentinels);
        Jedis jedis = null;
        try {
            printer("Fetching connection from pool");
            jedis = pool.getResource();
            Socket socket = jedis.getClient().getSocket();
            printer("Connected to " + socket.getRemoteSocketAddress());
            printer("Writing...");
            jedis.set("java-key-999", "java-value-999");
            printer("Reading...");
            jedis.get("java-key-999");
        } catch (JedisException e) {
            printer("Connection error of some sort!");
            printer(e.getMessage());
            Thread.sleep(2 * 1000);
        } finally {
            if (jedis != null) {
                jedis.close();
            }
        }
    }
}
```
