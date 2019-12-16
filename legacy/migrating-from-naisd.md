Migration from Naisd to Naiserator
==================================

## 1. Converting the manifest

Your NAIS manifest, commonly known as `nais.yaml`, needs to be converted from its current format into the new format.
Use the [Migrator](https://github.com/nais/migrator) tool to automatically convert manifests. The tool will also pull
required variables from _Fasit_ and inject them into the end result.

Migrator needs to be run from _utviklerimage_ to work correctly. You can download binaries for Windows or Linux
directly from the [releases page](https://github.com/nais/migrator/releases/tag/1.0.0).

Note that the `alerts` field has been replaced with the [Alert resource](../observability/alerts/README.md). If you
use alerting, you need to manually convert them into the new format. They are quite similar so it will be an easy job.

For more information about the new format, see the [NAIS manifest specification](../nais-application/manifest.md).

## 2. Cluster access

The new NAIS manifest is a [Kubernetes custom resource](https://kubernetes.io/docs/concepts/extend-kubernetes/api-extension/custom-resources/).
In order to manage your application, use the `kubectl` tool. Using this tool, you have the ability to inspect or restart the Docker container, among other things.

Check out our [guide on cluster access](../basics/access.md) for information on how to set this up.

## 3. Deploying applications

See the [Deploy your application](../basics/deploy.md) section.
