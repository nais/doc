
# FAQ/Troubleshooting

## Why do I have to specify a pool name if there is only `nav-dev` and `nav-prod`?

Custom pools might be added in the future, so this is done to avoid changing that part of the API.

## I can't produce/consume on my topic, with an error message like "topic not found". What's wrong?

You need to use the _fully qualified name_; check the `.status.fullyQualifiedName` field in your Topic resource.

## I can't produce/consume on my topic, with an error message like "not authorized". What's wrong?

Make sure you added the application to `.spec.acl` in your `topic.yaml`.

## I get the error _MountVolume.SetUp failed for volume "kafka-credentials" : secret ... not found_

Check the status of the `AivenApplication` resource created by Naiserator to look for errors.

## Are Schemas backed up?

Aiven makes backups of configuration and schemas every 3 hours, but no topic data is backed up by default.
See the [Aiven documentation](https://docs.aiven.io/docs/products/kafka/concepts/configuration-backup) for more details.
