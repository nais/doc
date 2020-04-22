---
description: >
  Backup and restore of all resources in the cluster provided by Velero. 
---

# Velero backup and restore

This feature is installed on all on-prem and GCP clusters. Velero is a product that includes features for backing up and restoring resources in kubernetes clusters. The backups are run every second hour on all clusters by the Velero schedule. Velero saves backups to gcp buckets and supports restores of specific resources or namespaces. All namespaces are backed up. The solution also creates snapshots of the persistent volumes in kubernetes.The setup for the schedule and deployment of Velero can be found in [navikt/nais-yaml].

See also [Velero documentation]

Contact [@Sten.Ivar.Røkke] for more information.

## How to

### Velero backup

The backups are run by a cron job every second hour. If need be, backups can be created on-demand. To create a backup use the [Velero client] and run the command which backs up the necessary resources and/or namespaces. 

To backup the example namespace:
```bash
velero backup create example --include-namespaces example
```

### Velero restore

The restores can be created to to disaster recovery of resources in the cluster. The restores can also be used to [migrate clusters].

To restore example namespace from the last backup:
```bash
velero restore create --from-schedule velero-schedule --include-namespaces example
```

To restore a deployment from the last backup (other resources types can also be specified):
```bash
velero restore create --from-schedule velero-schedule --include-namespaces example --include-resources deployment.apps
```

To restore from specific backup:
```bash
kubectl get backup -n velero
restore create --from-backup <backup id from previous command> --include-namespaces example
```

Specific resources can also be fetched from any backup.

### Velero logs

For completed backups and restores the logs can be read with the following commands:
```bash
kubectl get backup -n velero
velero backup logs <backup id from previous command>

kubectl get restore -n velero
velero restore logs <restore id from previous command>
```

## Metrics

General velero status matrics dashboard is available in grafana:

[Grafana Velero stats]

[navikt/nais-yaml]: https://github.com/navikt/nais-yaml.git
[Velero documentation]: https://velero.io/docs/master/how-velero-works/
[@Sten.Ivar.Røkke]: https://nav-it.slack.com/archives/D5KP2068Z
[Velero client]: https://velero.io/docs/master/basic-install/#install-the-cli
[migrate clusters]: https://velero.io/docs/master/migration-case/
[Grafana Velero stats]: https://grafana.adeo.no/d/YAniUGC/velero-stats?orgId=1&refresh=15m
