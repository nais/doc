Rook
====

https://rook.io/


Rook orchestrates our storage technology based on 
The rook operator is installed in the clusters through a Helm chart. The operator watches 
the cluster for CRDs to create storage clusters currently based on [Ceph](https://ceph.com/).

The CRDs we use are currently [block](https://github.com/rook/rook.github.io/blob/master/docs/rook/v0.7/block.md) and [object](https://github.com/rook/rook.github.io/blob/master/docks/rook/v0.7/object.md)


## Overview

* Operator runs in the nais namespace 
* Object store agents runs on all worker nodes to attach/detach persistent volumes to pods. 
* Ceph pods runs in nais-rook namespace and on dedicated nodes with storage disks. 


## How to's


### Checking/debugging CEPH status

There is a toolbox pod running with CEPH tools installed.

```
kubectl exec -it rook-ceph-tools sh -n nais-rook
```

Example troubleshooting tools:

``` 
ceph status
ceph osd status
ceph df
rados df
```


### Adding  a storage node

1. Provision CoreOS-node(s) in Basta adding "disk til lagringsnode".
2. Specs are 2 CPU, 16GB and 400GB disk.
3. Add to nais-inventory as worker and storage nodes.
4. Profit?

**Note that adding a node will cause CEPH to rebalance the cluster. See section on speeding up cluster recovery.**


### Removing a storage node

This is currently a manual process where we need to ensure that data is rebalanced to the other storage nodes.


#### Remove storage label from the node you want to remove: 

```
kubectl label node a30apvl00016.oera.no  nais.io/storage-node-
```


#### Remove entry for a30apvl00016.oera.no from the orchestration status map

```
 kubectl -n nais-rook edit cm rook-ceph-osd-orchestration-status

```


#### Find the OSD id for the node you want to remove

```text
 kubectl exec  rook-ceph-tools  -n nais-rook -- sh -c   "ceph osd status"
```

The osd you are looking for should **NOT** be marked as "up"


#### Delete config maps used by the OSD pod.

```text
kubectl -n nais-rook delete cm rook-ceph-osd-$OSD_ID-fs-backup
```

```text
kubectl -n nais-rook delete rook-ceph-osd-a30apvl00016.oera.no-config

```


#### Remove OSD from CEPH config 

Exec into the toolbox and run:

```text
ceph osd crush rm osd.$OSD_ID
ceph auth del osd.$OSD_ID
ceph osd rm $OSD_ID 
ceph osd crush rm a30apvl00016-oera-no
```

Make sure the cluster is healing it self by running 

```text
ceph health details
```
**Note that adding a node will cause CEPH to rebalance the cluster. See section on speeding up cluster recovery.**


### Speeding up ceph recovery

Exec into the toolbox pod and run:

```
ceph tell 'osd.*' injectargs '--osd-max-backfills 16'
ceph tell 'osd.*' injectargs '--osd-recovery-max-active 4'
```

**Note that speeding up may put strain on the cluster in general**
