---
description: MongoDB support in GCP
---

# MongoDB in GKE

!!! info "Disclaimer"
    Nais does not support MongoDB in GKE, however one can easily set up one manually. Your team is responsible for maintenance and upgrades.

First create your MongoDB-instance with the following StatefulSet. The following example creates an instance with three
replicas using a pre-existing storage-class. The storage-class is a cluster-wide resource. 

``` yaml
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: my-mongodb
  namespace: myteam
spec:
  serviceName: my-mongodb
  replicas: 3
  selector:
    matchLabels:
      role: my-mongodb
  template:
    metadata:
      labels:
        role: my-mongodb
        environment: test
        replicaset: MainRepSet
        app: my-mongodb
    spec:
      terminationGracePeriodSeconds: 10
      containers:
        - name: mongod-container
          image: mongo:5
          command:
            - "mongod"
            - "--bind_ip"
            - "0.0.0.0"
            - "--replSet"
            - "MainRepSet"
          resources:
            requests:
              cpu: 0.2
              memory: 1.25Gi
          ports:
            - containerPort: 27017
          volumeMounts:
            - name: mongodb-persistent-storage-claim
              mountPath: /data/db
  volumeClaimTemplates:
    - metadata:
        name: mongodb-persistent-storage-claim
        annotations:
          volume.beta.kubernetes.io/storage-class: "ssd-storage"
      spec:
        accessModes: [ "ReadWriteOnce" ]
        resources:
          requests:
            storage: 1Gi
```

Next, create a network policy to allow traffic from your application to MongoDB-instance. This is not handled by
Naiserator, hence you will need an additional policy.

``` yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  labels:
    app: my-mongodb
    team: myteam
  name: my-mongodb
  namespace: myteam
spec:
  egress:
    - to:
        - namespaceSelector:
            matchLabels:
              linkerd.io/is-control-plane: "true"
        - namespaceSelector: {}
          podSelector:
            matchLabels:
              role: my-mongodb
        - namespaceSelector: {}
          podSelector:
            matchLabels:
              k8s-app: kube-dns
        - ipBlock:
            cidr: 0.0.0.0/0
            except:
              - 10.6.0.0/15
              - 172.16.0.0/12
              - 192.168.0.0/16
  ingress:
    - from:
        - namespaceSelector:
            matchLabels:
              name: nais
          podSelector:
            matchLabels:
              app: prometheus
    - from:
        - namespaceSelector:
            matchLabels:
              name: myteam
          podSelector:
            matchLabels:
              app: myapp
    - from:
        - namespaceSelector: {}
          podSelector:
            matchLabels:
              role: my-mongodb
    - from:
        - namespaceSelector:
            matchLabels:
              linkerd.io/is-control-plane: "true"
    - from:
        - namespaceSelector:
            matchLabels:
              linkerd.io/extension: viz
          podSelector:
            matchLabels:
              component: tap
    - from:
        - namespaceSelector:
            matchLabels:
              linkerd.io/extension: viz
          podSelector:
            matchLabels:
              component: prometheus
  podSelector:
    matchLabels:
      role: my-mongodb
  policyTypes:
    - Ingress
    - Egress
```

Then create a service for your MongoDB-instance.

``` yaml
apiVersion: v1
kind: Service
metadata:
  name: my-mongodb
  namespace: myteam
  labels:
    name: my-mongodb
spec:
  ports:
    - port: 27017
      targetPort: 27017
  clusterIP: None
  selector:
    role: my-mongodb
```

In your application-yaml, define an accessPolicy to allow traffic to the MongoDB-instance.

``` yaml
apiVersion: "nais.io/v1alpha1"
kind: "Application"
metadata:
  name: myapp
  namespace: myteam
  labels:
    team: myteam
spec:
  accessPolicy:
    outbound:
      rules:
      - application: my-mongodb
  env:
  - name: MONGODB_URL
    value: mongodb://my-mongodb-0.my-mongodb:27017,my-mongodb-1.my-mongodb:27017,my-mongodb-2.my-mongo:27017/deploy_log?replicaSet=MainRepSet
```

## Backup of MongoDB-instance

Nais does not provide any backup solution for MongoDB-instances. However, one can easily set up cronjob for backup purposes. 
The following bash script will create a gzipped dump of my-mongodb-0, which then will be uploaded to the GCP storage bucket
of your choosing. In production, the buckets will be archived on-premises as well.

``` shell 
#!/usr/bin/env bash

if ! kubectl exec -it -n aura my-mongodb-0 -c mongod-container -- mongodump --archive --gzip > ./dump.gz; then
  echo "failed to execute mongodump"
  exit 1
fi

backup_name="dump_$(date +"%Y-%m-%d_%H-%M").tgz"
if ! gsutil mv "./dump.gz" "gs://<backup-bucket-name>/$backup_name"; then
  echo "failed to upload backup to bucket"
  exit 1
fi

rm dump.gz
```

To set up your backup job you need a Naisjob bundling your bash script, a NetworkPolicy and RBAC resources as described below.

```yaml 
apiVersion: nais.io/v1
kind: Naisjob
metadata:
  labels:
    team: myteam
  name: my-backup
  namespace: myteam
spec:
  activeDeadlineSeconds: 6000
  backoffLimit: 5
  failedJobsHistoryLimit: 2
  gcp:
    buckets:
      - cascadingDelete: false
        name: my-backup-bucket
        retentionPeriodDays: 30
  image: ghcr.io/navikt/my-backup:1.0
  resources:
    limits:
      cpu: 200m
      memory: 128Mi
    requests:
      cpu: 100m
      memory: 64Mi
  restartPolicy: Never
  schedule: '0 */6 * * *'
  skipCaBundle: true
  successfulJobsHistoryLimit: 2
  ttlSecondsAfterFinished: 60
---
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  labels:
    app: my-backup
    team: myteam
  name: my-backup-apiserver
  namespace: myteam
spec:
  egress:
  - to:
    - ipBlock:
        cidr: 172.16.0.2/32
  podSelector:
    matchLabels:
      app: my-backup
  policyTypes:
  - Egress
---
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  name: my-backup
  namespace: myteam
rules:
  - apiGroups: [ "" ]
    resources: [ "pods/exec" ]
    verbs: [ "create" ]
---
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: my-backup
  namespace: myteam
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: Role
  name: my-backup
subjects:
- namespace: myteam
  kind: ServiceAccount
  name: my-backup
```
