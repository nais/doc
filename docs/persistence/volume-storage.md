---
description: >-
  Volume storage is a storage solution based on kubernetes PV and PVC used for
  persistent storage.
---

# Persistent Volume Storage

Volume storage is a storage solution based on Kubernetes [PV][k8s-pv] and [PVC][k8s-pvc] used for persistent storage.

[k8s-pv]: https://kubernetes.io/docs/concepts/storage/persistent-volumes/
[k8s-pvc]: https://kubernetes.io/docs/concepts/storage/persistent-volumes/#persistentvolumeclaims

Volume storage is concidered a last resort for storage and only if the existing other storage solutions are not suitable for your use case. Please make sure you have concidered [all other options](./README.md) first.

## Limitations

Volume storage has the following limitations:

 * Only available in GCP.
 * There is no automatic backup and restore of data.
 * There is no automatic scaling of the volume size.
 * A volume can only be mounted to one pod at a time. Which means that if you have multiple pods they not share a single volume.

    It also means that if you have only one instance it needs to be completely stopped before a new instance can be started with the same volume resulting in downtime.

Even though you can request very large volumes is not a good solution for storing large amounts of data. We do not recommended storing more than 100GB of data in a single volume.

## Example application

An example app `myapp` with a volume of `1Gi`:

```yaml
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: myapp
spec:
  serviceName: myapp
  replicas: 1
  selector:
    matchLabels:
      app: myapp
  template:
    metadata:
      labels:
        app: myapp
    spec:
      containers:
      - name: myapp
        image: myapp:latest
        volumeMounts:
        - name: myapp-storage
          mountPath: /data
  volumeClaimTemplates:
  - metadata:
      name: myapp-storage
    spec:
      accessModes: [ "ReadWriteOnce" ]
      resources:
        requests:
          storage: 1Gi
```

## Storage classes

By default, dynamically provisioned `PersistentVolumes` use the `default` `StorageClass` and are backed by standard hard disks. If you need faster SSDs, you can use the `ssd-storage` storage class.

To set the storage class for a volume, add the `storageClassName` field to the `PersistentVolumeClaim`:

```yaml
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: myapp
spec:
  ...
  volumeClaimTemplates:
  - metadata:
      name: myapp-storage
    spec:
      storageClassName: ssd-storage
      ...
```

## Volume Snapshot

In Kubernetes, a VolumeSnapshot represents a snapshot of a volume on a storage system. It assumes that you are already familiar with Kubernetes persistent volumes.

```yaml
apiVersion: snapshot.storage.k8s.io/v1
kind: VolumeSnapshot
metadata:
  name: new-snapshot-test
spec:
  volumeSnapshotClassName: csi-hostpath-snapclass
  source:
    persistentVolumeClaimName: pvc-test
```

## Volume Resize

You can resize a volume by editing the `spec.resources.requests.storage` field of the PersistentVolumeClaim object.

```bash
kubectl patch pvc myapp-storage -p '{"spec":{"resources":{"requests":{"storage":"2Gi"}}}}'
```

This will resize the volume to `2Gi`. The volume will be resized when the pod is restarted.

## Reference

* [GKE Deploying a stateful application](https://cloud.google.com/kubernetes-engine/docs/tutorials/stateful-application)
* [GKE StatefulSet](https://cloud.google.com/kubernetes-engine/docs/concepts/statefulset)
* [Kubernetes StatefulSets](https://kubernetes.io/docs/concepts/workloads/controllers/statefulset/)

