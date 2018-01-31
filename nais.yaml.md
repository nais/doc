# Nais.yaml

This file contains the configuration of your nais application. It must reside within the git repository together with your source code.

The main documentation for the content of this file is found here: https://github.com/nais/naisd/blob/master/nais_example.yaml


## Leader election

With leader election you can have one responsible pod. This can be used to control that only one pod runs a batch-job or similar tasks. This is done by asking the `elector` pod which pod is the current leader, and comparing that to the pods hostname.

The leader election configuration does not control which pod the external service requests will be routed to.


### Enable leader election

Enabling leader election in your pod is done by adding the line `leaderElection: true` to your `nais.yaml`-file. With that setting, `naisd` will sidecar an elector container into your pod.

When you have the `elector` container running in your pod, you can run a HTTP GET on the URL set in environment variable `$ELECTOR_PATH` to see which pod is the leader. This will return a json with the name of the leader, which you can now compare with your hostname.


#### cURL example

```bash
$ kubectl exec -it elector-sidecar-755b7c5795-7k2qn -c debug bash
root@elector-sidecar-755b7c5795-7k2qn:/# curl $ELECTOR_PATH
{"name":"elector-sidecar-755b7c5795-2kcm7"}
```


## Issues
* Kubernetes' `leader-election`-image does not support fencing, which means it does not guarantee there is only one leader. As long as the date and time in the pods are syncronized, this should not be an issue.
* Redeploy of the deployment/pods will sometime make the non-leaders believe that the old leader still exists and is the leader. The current leader is not affected, and will be aware that the pod itself is the leader. This is not really an issue as long as you do not need to know exactly which pod is the leader. This can be resolved by deleting pods with erroneous leader election configuration.
