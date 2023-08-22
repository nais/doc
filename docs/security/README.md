---
description: >-
    NAIS is a platform for building, deploying and operating applications in a
    secure manner. This document describes on a high level how NAIS achieves this and what is expected of those who use NAIS.
---

# Security in NAIS

NAIS is a platform for building, deploying and operating applications in a
secure manner. This document describes on a high level how NAIS achieves this
and what is expected of those who use NAIS.

## Responsibility Segregation

NAIS is a shared responsibility between the application team and the NAIS
platform team. The platform team is responsible for providing securing the
underlying infrastructure and providing the tools and necessary for secure
software development lifecycle, and the application team is responsible for
using these tools and following the guidelines provided by the platform team.

## Security Principles

NAIS is built on the following security principles:

1. **Defense in depth** - NAIS is built on the principle of defense in depth.
This means that security is built into every layer of the platform, from the
underlying infrastructure to the application code. This is achieved by using
multiple layers of security controls, so that if one layer fails, the next layer
will provide protection.

1. **Least privilege** - NAIS is built on the principle of least privilege. This
means that every component of the platform is given the minimum amount of
privileges necessary to perform its function. This is achieved by using
role-based access control (RBAC) and by using the principle of separation of
duties.

1. **Secure by default** - NAIS is built on the principle of secure by default.
This means that unless explicitly allowed, everything is denied. Workloads are
not allowed to communicate with each other unless explicitly allowed by network
policies.

## Team Isolation

Each team in NAIS has its own isolated environment, which is only accessible by
the members of the team. This is achieved by creating a separate Kubernetes
namespace and Google Cloud project that is only accessible by the members of the
team.

```mermaid
graph LR
subgraph NAIS
  subgraph Kubernetes
    subgraph team-a-ns[Team A]
      team-a-app[App A]
    end

    subgraph team-b-ns[Team B]
      team-b-app[App B]
    end

    subgraph team-c-ns[Team C]
      team-c-app[App C]
    end
  end

  subgraph GCP[Google Cloud]
    subgraph team-a-project[Team A]
      team-a-db[Database A]
    end

    subgraph team-b-project[Team B]
      team-b-db[Database B]
    end

    subgraph team-c-project[Team C]
      team-c-db[Database C]
    end
  end
end

team-a-app --> team-a-db
team-b-app --> team-b-db
team-c-app --> team-c-db
```

Teams are managed in [NAIS Teams](../basics/teams.md).

## Secure Software Development Lifecycle (Secure SDLC)

NAIS is not a complete solution for secure software development lifecycle. It is
a platform for building, deploying and operating applications in a secure manner
as a part of a larger secure software development lifecycle.

Here is a high level overview of the secure software development lifecycle
provided by NAIS:

1. Build-phase
    1. [Secrets](#secrets)
    1. [External dependencies](#external-dependencies)

1. Deploy-phase
    1. [Supply Chain](#supply-chain)
    1. [Security Policies](#security-policies)

1. Operate-phase
    1. [Developer access](#developer-access)
    1. [User authentication](#user-authentication)
    1. [Network security](#network-security)
    1. [Logging and monitoring](#logging-and-monitoring)

### Build

#### Secrets

NAIS provides a secure way to store secrets in the form of [Kubernetes
secrets][kubernetes-secrets]. These secrets are encrypted at rest and are only
accessible by the application that they are associated with.

In addition to Kubernetes secrets NAIS provides integration with [Google Secrets
Manager][google-secrets-manager] and [Hashicorp Vault][hashicorp-vault] for
enhanced secret management.

[kubernetes-secrets]: ./secrets/kubernetes-secrets.md
[google-secrets-manager]: ./secrets/google-secrets-manager.md
[hashicorp-vault]: ./secrets/vault.md

#### External dependencies

NAIS provides a secure way to provision external dependencies like databases and
message queues. These external dependencies are created as a part of the
application deployment process and are only accessible by the application that
they are associated with and nothing else.

External dependencies are created with secure defaults like encryption intransit
and encryption at rest. They are continuously updated by the platform the
respective service providers to ensure that they stay up to date with the latest
secure features over time.

NAIS provides the following external dependencies:

| Service                                     | Description          | Provider                                                 |
| ------------------------------------------- | -------------------- | -------------------------------------------------------- |
| [PostgreSQL](../persistence/postgres.md)    | Relational database  | [Google Cloud SQL](https://cloud.google.com/sql)         |
| [Buckets](../persistence/bigquery.md)       | Object storage       | [Google Cloud Storage](https://cloud.google.com/storage) |
| [BigQuery](../persistence/bigquery.md)      | Data warehouse       | [Google BigQuery](https://cloud.google.com/bigquery)     |
| [InfluxDB](../persistence/influxdb.md)      | Time series database | [Aiven Influx](https://aiven.io/influxdb)                |
| [Redis](../persistence/redis.md)            | In-memory database   | [Aiven Redis](https://aiven.io/redis)                    |
| [OpenSearch](../persistence/open-search.md) | Search engine        | [Aiven OpenSearch](https://aiven.io/opensearch)          |
| [Kafka](../persistence/kafka/README.md)     | Message queues       | [Aiven Kafka](https://aiven.io/kafka)                    |

Read more about [external dependencies](../persistence/README.md) and [responsibilities](../persistence/responsibilities.md).

### Deploy

#### Supply Chain

NAIS provides a secure way to deploy applications using [Supply-chain Levels for
Software Artifacts (SLSA)][slsa]. This means that every application is deployed
using a secure supply chain that ensures that the application is deployed in a
secure manner.

[slsa]: ./salsa/salsa.md

#### Security Policies

NAIS provides a secure way to enforce security policies on applications using
[Kyverno][kyverno] policy engine. This means that every application is deployed
with a set of security policies that ensure that the application is deployed in
a secure manner.

The following security policies are enforced by NAIS:

| Policy                           | Description                                                                                                                                                                                                                                                                                                                                                            |
| -------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `deny-image-registries`          | Deny images from registries not on the list of allowed registries. See documentation: <https://docs.nais.io/deployment/allowed-registries>                                                                                                                                                                                                                             |
| `deny-specific-service-types`    | This policy denies the creation of services with types other than `ClusterIP` and `ExternalName`.                                                                                                                                                                                                                                                                      |
| `disallow-host-namespaces`       | Host namespaces (Process ID namespace, Inter-Process Communication namespace, and network namespace) allow access to shared information and can be used to elevate privileges. Pods should not be allowed access to host namespaces. This policy ensures fields which make use of these host namespaces are unset or set to `false`.                                   |
| `disallow-host-path`             | HostPath volumes let Pods use host directories and volumes in containers. Using host resources can be used to access shared data or escalate privileges and should not be allowed. This policy ensures no hostPath volumes are in use.                                                                                                                                 |
| `disallow-host-ports`            | Access to host ports allows potential snooping of network traffic and should not be allowed, or at minimum restricted to a known list. This policy ensures the `hostPort` field is unset or set to `0`.                                                                                                                                                                |
| `disallow-host-process`          | Windows pods offer the ability to run HostProcess containers which enables privileged access to the Windows node. Privileged access to the host is disallowed in the baseline policy. HostProcess pods are an alpha feature as of Kubernetes v1.22. This policy ensures the `hostProcess` field, if present, is set to `false`.                                        |
| `disallow-privilege-escalation`  | Privilege escalation, such as via set-user-ID or set-group-ID file mode, should not be allowed. This policy ensures the `allowPrivilegeEscalation` field is set to `false`.                                                                                                                                                                                            |
| `disallow-privileged-containers` | Privileged mode disables most security mechanisms and must not be allowed. This policy ensures Pods do not call for privileged mode.                                                                                                                                                                                                                                   |
| `disallow-proc-mount`            | The default /proc masks are set up to reduce attack surface and should be required. This policy ensures nothing but the default procMount can be specified. Note that in order for users to deviate from the `Default` procMount requires setting a feature gate at the API server.                                                                                    |
| `disallow-selinux`               | SELinux options can be used to escalate privileges and should not be allowed. This policy ensures that the `seLinuxOptions` field is undefined.                                                                                                                                                                                                                        |
| `restrict-apparmor-profiles`     | On supported hosts, the 'runtime/default' AppArmor profile is applied by default. The default policy should prevent overriding or disabling the policy, or restrict overrides to an allowed set of profiles. This policy ensures Pods do not specify any other AppArmor profiles than `runtime/default` or `localhost/*`.                                              |
| `restrict-sysctls`               | Sysctls can disable security mechanisms or affect all containers on a host, and should be disallowed except for an allowed "safe" subset. A sysctl is considered safe if it is namespaced in the container or the Pod, and it is isolated from other Pods or processes on the same Node. This policy ensures that only those "safe" subsets can be specified in a Pod. |
| `restrict-volume-types`          | In addition to restricting HostPath volumes, the restricted pod security profile limits usage of non-core volume types to those defined through PersistentVolumes. This policy blocks any other type of volume other than those in the allow list.                                                                                                                     |
| `validate-ephemeral-containers`  | Ephemeral containers must use allowed images and have limited capabilities. When using 'kubectl debug' please set flag `--profile=restricted`. For-example: `kubectl debug -it --image=cgr.dev/chainguard/busybox:latest --profile=restricted`                                                                                                                         |

[kyverno]: https://kyverno.io/

### Operate

#### Developer access

Developer access control in NAIS is backed by [Google Cloud IAM][google-iam] and
[Kubernetes RBAC][kubernetes-rbac]. The platform is responsible for setting up
the necessary roles and permissions in Google Cloud IAM and Kubernetes RBAC
according to the teams registered in [NAIS Teams](../basics/teams.md) by the
developers.

Tools and services provided by the platform to the developers are exposed
securely in two ways:

1. On a private network only accessible to authenticated users over
[naisdevice](../device/README.md) to trusted devices using secure
[WireGuard][wireguard] VPN tunnels.

1. On a public network behind [Identity Aware Proxy (IAP)][google-iap] which
ensures that all developers are authenticated with their personal user accounts.

[kubernetes-rbac]: https://kubernetes.io/docs/reference/access-authn-authz/rbac/
[google-iam]: https://cloud.google.com/iam/
[google-iap]: https://cloud.google.com/iap/
[wireguard]: https://www.wireguard.com/

#### User authentication

User authentication and authorization ("authnz") is the responsibility of each
application running on the plattform. Authorization (i.e. "who is allowed to see
and do what under which circumstances") is part of the business logic for each
domain, so it makes sense that it is handled by the teams in their apps. Doing
authnz right is complicated, so the plattform offers a few tools and services to
assist.

We recommend using OIDC to authenticate humans. The platform will (given a few
lines of configuration) automatically provision clients at our main identity
providers [Azure AD](auth/azure-ad/README.md) (for employees) and
[ID-porten](auth/idporten.md) (for the public). The secrets associated with
these clients are handled behind the scenes and rotated regularly. To ease
validating the OIDC tokens we offer our "OIDC as a sidecar" named
[Wonderwall](../appendix/wonderwall.md).

For service to service-communication further down in the call chain we offer our
own implementation of the "OAuth2 Token Exchange" standard named
[TokenX](auth/tokenx.md). Using TokenX eliminates the need for shared "service
users" with long-lived credentials and wide permissions.

For machine to machine-communication between government agencies "Maskinporten"
is widely used. The platform offers [the same type of
support](auth/maskinporten/README.md) for integrating with Maskinporten as we do
for the other OIDC/OAuth uses cases mentioned above.

#### Network security

Network security in NAIS is achieved by [Access
Policy](../nais-application/access-policy.md) that is backed by [Kubernetes
Network Policies][kubernetes-network-policies]. This controls traffic between
pods in the same cluster as well as outgoing traffic from the cluster.

Pod-to-pod traffic is also protected by [mTLS with
Linkerd](../nais-application/linkerd.md) that attaches a sidecar to every pod
that handles the encryption and decryption of traffic between pods and authenticates
the identity of the pods.

In addition to this, NAIS provides integration with [Google Cloud
Armor][google-cloud-armour] for enhanced network security. This controls
incoming traffic to the cluster and adds Web Application Firewall (WAF) and
Distributed Denial of Service (DDoS) protection.

[kubernetes-network-policies]: https://kubernetes.io/docs/concepts/services-networking/network-policies/
[google-cloud-armour]: https://cloud.google.com/armor

#### Logging and monitoring

Application logs are collected and stored in
[Kibana](../observability/logs/README.md) together with infrastructure
components running in the cluster.

Application metrics are collected and stored in
[Prometheus](../observability/metrics.md) together with infrastructure
components running in the cluster.

Infrastructure, network flow logs and IAM audit logs are available from
[Google Cloud Monitoring][google-cloud-monitoring].

[google-cloud-monitoring]: https://cloud.google.com/monitoring

## References

* [Google Cloud Architecture Framework: Security, privacy, and compliance](https://cloud.google.com/architecture/framework/security)
* [Security Pillar - AWS Well-Architected Framework](https://docs.aws.amazon.com/wellarchitected/latest/security-pillar/welcome.html)
