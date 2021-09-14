# Migrating from on-prem to Aiven

There are multiple viable strategies for migrating to Aiven. Which one is best for your team depends on many factors. Here we will describe a few approaches, other approaches are also possible. You need to find the one that suits your situation best. Make sure you understand how the different approaches affects your message processing. Some approaches might result in messages being processed more than once, and some approaches might allow for messages to be processed out of order.

*If you are using the Schema Registry, you need to make sure that your schemas are uploaded to the new schema registry in Aiven when migrating. How you do that depends on how you do your migration.*

The first step is always:

* Create the topic using the new [Topic resource](manage_topics.md#creating-topics-and-defining-access), and set proper ACLs

The final step should always be:

* Remove the topic from the on-prem clusters, making sure to delete all data

## The simplest case

This approach is suitable if:

* You don't need to keep historical data
* You control all producers and consumers of the topic
* A short pause in processing of messages is acceptable

The process is quite simple:

1. Change producers to write messages to Aiven
2. Wait for consumers to process the last messages on-prem
3. Change consumers to read messages from Aiven

## Double producer

This approach is suitable if:

* You don't need to keep historical data
* You control the producer
* Your messages are idempotent

Follow these steps:

1. Change producers to write messages both to on-prem and to Aiven
2. Change consumers to read messages from Aiven, allowing for the fact that some messages will be 

   processed twice \(once when read from on-prem, once when read from Aiven\)

3. When all consumers are reading from Aiven, remove old code from producer

## Double consumers

This approach is suitable if:

* You don't need to keep historical data
* The consumers are easier to change than the producer, or there are multiple producers

Follow these steps:

1. Change all consumers to read messages from both on-prem and Aiven
2. Change producer\(s\) to write messages to Aiven
3. Wait for consumers to process last messages on-prem
4. Remove old code from consumers

## Simple mirroring

This approach is suitable if:

* You have historical data you wish to keep
* You can afford a pause in processing of messages
* You don't use Schema Registry

Follow these steps:

1. Create a mirroring application that reads messages from on-prem and writes them to Aiven (The NAIS team has created [AiviA](https://github.com/nais/aivia) for this)
2. Stop producers
3. Wait for mirroring to catch up
4. Change consumers to read messages from Aiven
5. Change producer to write messages to Aiven
6. Delete mirroring application

## Advanced mirroring

This approach is more complicated and requires considerable effort to get set up and working correctly. If possible we want to avoid having to do this.

This approach is suitable if:

* You have historical data you wish to keep
* You can't afford a pause in processing of messages
* Your messages are not idempotent
* You require migrating Schemas in sync with migrating messages

Follow these steps:

1. Contact us to discuss if you really need this
2. Wait while we set up and configure MirrorMaker to handle the mirroring of your topic, including schemas and consumer offsets
3. Change consumers to read messages from Aiven
4. Change producer to write messages to Aiven
5. Remove MirrorMaker configuration (or let us know that we can remove it)
