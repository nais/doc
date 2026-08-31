---
tags: [kafka, troubleshooting, debugging, how-to]
conditional: [not-test-nais]
---

# Troubleshooting

## Topic authorization failed for topics

When you get a topic authorization failed error in your application, it means that the application has authenticated correctly with the cluster, but does not have the necessary permissions to access the topic.

This can happen for a number of reasons:

### The application is not listed in the ACLs for the topic.

* Check that the application is listed with correct namespace and application name
* Check that the application has the correct permissions for the topic

### In rare cases, the Kafka cluster may not have received the ACLs update by the time your application connects.

* Make sure your application retries the operation after a short delay
* If the problem persists, contact the nais team for assistance

## Testing your application

To test that you have configured your consumer application correctly, you can use one of the kafkarator-canary topics.
All applications (from all teams) have read access to the canary topics.
All the canary topics receives messages on a fixed interval, containing a RFC3339 formatted timestamp.
The only difference between each, is where the producer is located.
The available canary topics are:

| Pool     | Topic name                              |
| :------- | :-------------------------------------- |
| nav-dev  | nais-verification.kafka-canary-dev-gcp  |
| nav-dev  | nais-verification.kafka-canary-dev-fss  |
| nav-prod | nais-verification.kafka-canary-prod-gcp |
| nav-prod | nais-verification.kafka-canary-prod-fss |
