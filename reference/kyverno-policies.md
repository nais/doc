# Kyverno policies

## 001 - Add spot toleration

This policy adds a toleration for pods to be deployed to nodes on spot
instances, for cost reasons.

## 002 - Default allow egress

This policy generates a default allow egress NetworkPolicy for all
Namespaces. It allows all egress traffic except for RFC 1918 private
address space. This policy is based on the following Kubernetes
NetworkPolicy:
https://kubernetes.io/docs/concepts/services-networking/network-policies/#default-allow-all-egress TODO: fix link

## 003 - Deny image registries

This policy denies images from registries not on the list of allowed
registries. See documentation:
https://docs.nais.io/deployment/allowed-registries # TODO: fix link

## 004 - Deny creation of Kafka Topics

This policy Denies the creation of Kafka Topics. Documentation:
https://docs.nais.io/persistence/kafka/manage_topics # TODO: fix link

## 005 - Deny delete of Kafka topics

This policy Denies the deletion of Kafka topics without the
kafka.nais.io/removeDataWhenResourceIsDeleted annotation.
Documentation:
https://docs.nais.io/persistence/kafka/manage_topics/#permanently-deleting-topic-and-data.

## 006 - Deny specific service types

This policy denies the creation of services with types other than ClusterIP and ExternalName.
This policy is based on the example policy from the Kyverno documentation.
https://kyverno.io/docs/writing-policies/deny-service-types/

## 007 - Replace legacy GitHub registry

This policy rewrites references to the old GitHub registry (docker.pkg.github.com) with the new one (ghcr.io).

## 008 - Verify SLSA Provenance (Keyless)

This policy uses artifact provenance to identify how an artifact was produced
and from where it originated. SLSA provenance is an industry-standard
method of representing that provenance. This policy verifies that an
image has SLSA provenance and was signed by the expected subject and issuer
when produced through GitHub Actions. It requires configuration based upon
your own values.

## 009 - Ephemeral containers with allowed images and limited capabilities

This policies ensures that ephemeral containers use allowed images and have limited capabilities.
When using 'kubectl debug' please set flag `--profile=restricted`.
For-example: `kubectl debug -it --image=cgr.dev/chainguard/busybox:latest --profile=restricted`
