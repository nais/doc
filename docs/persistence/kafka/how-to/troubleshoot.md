---
tags: [kafka, troubleshooting, debugging, how-to]
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
