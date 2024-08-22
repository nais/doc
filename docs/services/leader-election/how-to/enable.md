---
tags: [leader-election, how-to]
---

# Enable Leader Election

This guide will show you how to enable leader election for your application.

## Enable leader election in [manifest](../../../workloads/application/reference/application-spec.md#leaderelection)

???+ note ".nais/app.yaml"

    ```yaml 
    spec:
      leaderElection: true
    ```

## Using leader election in your application (simple API)

=== "Java"

    ```java
    // Implementation of getJSONFromUrl is left as an exercise for the reader
    class Leader {
        public static boolean isLeader() {
            String electorUrl = System.getenv("ELECTOR_GET_URL");
            JSONObject leaderJson = getJSONFromUrl(electorUrl);
            String leader = leaderJson.getString("name");
            String hostname = InetAddress.getLocalHost().getHostname();

            return hostname.equals(leader);
        }
    }
    ```

=== "cURL"

    ```bash
    $ kubectl exec -it elector-sidecar-755b7c5795-7k2qn -c debug bash
    root@elector-sidecar-755b7c5795-7k2qn:/# curl ${ELECTOR_GET_URL}
    {"name":"elector-sidecar-755b7c5795-2kcm7","last_update":"2022-10-18T10:59:58Z"}
    ```

=== "Python"

    ```python
    import os
    import socket
    import requests

    def is_leader():
        elector_url = os.getenv("ELECTOR_GET_URL")
        resp = requests.get(elector_url)
        leader = resp.json()["name"]
        return socket.gethostname() == leader    
    ``` 

=== "TypeScript"

    ```typescript
    import * as os from 'node:os'
    
    export async function isLeader(): Promise<boolean> {
        const hostname = os.hostname()
        const electorUrl = process.env.ELECTOR_GET_URL
    
        const electorResponse = await fetch(electorUrl)
        if (!electorResponse.ok) {
            throw new Error(
                `Failed to fetch leader from ${electorUrl}, response: ${electorResponse.status} ${electorResponse.statusText}`,
            )
        }
        const result: { name: string; last_update: string } = await electorResponse.json()
    
        return result.name === hostname
    }
    ```


## Using leader election in your application (Server Sent Events API)

:construction_worker: Help Wanted! Please contribute with examples on how to use the Server Sent Events API.
