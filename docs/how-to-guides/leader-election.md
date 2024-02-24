# Enable Leader Election

This guide will show you how to enable leader election for your application.

## 0. Enable leader election in [manifest](../reference/application-spec.md#leaderelection)

???+ note ".nais/app.yaml"

    ```yaml 
    spec:
      leaderElection: true
    ```

## 1. Using leader election in your application

=== "java"

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

=== "cURL"

    ```bash
    $ kubectl exec -it elector-sidecar-755b7c5795-7k2qn -c debug bash
    root@elector-sidecar-755b7c5795-7k2qn:/# curl $ELECTOR_PATH
    {"name":"elector-sidecar-755b7c5795-2kcm7","last_update":"2022-10-18T10:59:58Z"}
    ```
