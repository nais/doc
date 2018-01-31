# Nais.yaml

This file is the main point for configuring your nais application. It must reside in the git repository together wih you code

The main documentation for the content of this file is always found here: https://github.com/nais/naisd/blob/master/nais_example.yaml


## Leader election

With leader election you can have one responsible pod. This can be used to control that only one pod runs a batch-job or similar tasks. This is done by asking the `elector` pod for who is the current leader, and comparing that to the pod owns hostname.

The leader election dosen't controll which pod external services hits.


### Enable leader election

It's pretty easy to enable leader election in your pod, you just have to add the line `leaderElection: true` to your `nais.yaml`-file. When that is done, on your next deploy, `naisd` will sidecar an elector container into your pod.

When you have the `elector` container running in your pod, you can run a HTTP GET on the URL from the environment variable `$ELECTOR_PATH` to see who is the leader. This will return a json with the name of the leader, which you can compare with your hostname.


#### cURL example

```bash
$ kubectl exec -it elector-sidecar-755b7c5795-7k2qn -c debug bash
root@elector-sidecar-755b7c5795-7k2qn:/# curl $ELECTOR_PATH
{"name":"elector-sidecar-755b7c5795-2kcm7"}
```


## Issues
* Kubernetes' `leader-election`-image dosen't support fencing, which means that it does not guarantee that there is only one leader. As long as the clocks in the pods are syncronized, this will not be an issue.
* Redeploy of the deployment/pods will sometime make the non-leaders believe that the old leader still exists and is the leader. The current leader is not affected, and do know that the pod it self is the leader. This is not really an issue as long as you don't need to know exactly who is the leader. Can be resolved by deleting pods that are mistaken.
