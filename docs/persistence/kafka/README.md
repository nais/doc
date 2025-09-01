---
description: >-
  Kafka is a distributed streaming platform that can be used to publish and
  subscribe to streams of records. It is a good alternative to synchronous
  communication between services if you need to decouple services.
tags: [kafka, explanation, persistence, services]
---

# Kafka

Nais offers Kafka as a managed service through Aiven.

Start using Kafka by [creating a `Topic` resource](how-to/create.md) in one of our Kubernetes clusters.

A `Topic` belongs to one of the Kafka _pools_.
A pool is a highly available, replicated Kafka cluster running at Aiven.
After the topic is created, relevant users are added to the topic's access control list (ACL).

To get started with Kafka in your application, see [accessing topics from an application](how-to/access.md).

!!! note "Backups and recovery"

    Kafka as a system is highly durable, and is designed to be able to keep your data safe in the event of a failure.
    This requires a properly configured replication factor for your topic, and that your clients use the appropriate strategy when sending messages and committing offsets.
    Even so, our recommendation is that Kafka should not be the master of your data, and you should have the ability to restore your data from some other system.

## What happens on deploy?

When you deploy an application that requests access to Kafka, Naiserator will create an `AivenApplication` resource in the cluster.
The `AivenApplication` has a name that matches the deployed application, and the name of the secret to generate.
Naiserator will request that a secret with this name used in the deployment.

When an `AivenApplication` resource is created or updated, Aivenator will create a new service user and generate credentials.
These credentials are then inserted into the requested secret and used in the deployment.

If there is a problem generating the secret, this might fail your deployment.
In this case, Aivenator will update the `status` part of the resource, with further information about the problem.

## Application design guidelines

### Authentication and authorization

The Nais platform will generate new credentials when your applications is deployed. Kafka requires TLS client certificates for authentication. Make sure your Kafka and/or TLS library can do client certificate authentication, and that you can specify a custom CA certificate for server validation.

### Readiness and liveness

Making proper use of liveness and readiness probes can help with many situations.
If producing or consuming Kafka messages are a vital part of your application, you should consider failing one or both probes if you have trouble with Kafka connectivity.
Depending on your application, failing liveness might be the proper course of action.
This will make sure your application is restarted when it is experiencing problems, which might help.

In other cases, failing just the readiness probe will allow your application to continue running, attempting to move forward without being killed.
Failing readiness will be most helpful during deployment, where the old instances will keep running until the new are ready.
If the new instances are not able to connect to Kafka, keeping the old ones until the problem is resolved will allow your application to continue working.

## FAQ/Troubleshooting

### Why do I have to specify a pool name if there is only `nav-dev` and `nav-prod`?
!!! faq "Answer"
    Custom pools might be added in the future, so this is done to avoid changing that part of the API.

### I can't produce/consume on my topic, with an error message like "topic not found". What's wrong?
!!! faq "Answer"
    You need to use the _fully qualified name_; check the `.status.fullyQualifiedName` field in your Topic resource.

### I can't produce/consume on my topic, with an error message like "not authorized". What's wrong?
!!! faq "Answer"
    Make sure you added the application to `.spec.acl` in your `topic.yaml`.

### I get the error _MountVolume.SetUp failed for volume "kafka-credentials" : secret ... not found_
!!! faq "Answer"
    Check the status of the `AivenApplication` resource created by Naiserator to look for errors.

### Are Schemas backed up?
!!! faq "Answer"
    Aiven makes backups of configuration and schemas every 3 hours, but no topic data is backed up by default.
See the [Aiven documentation](https://aiven.io/docs/products/kafka/concepts/configuration-backup) for more details.
