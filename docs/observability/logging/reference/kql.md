---
title: KQL Reference
description: Kibana Query Language (KQL) Reference for filtering data in Kibana.
tags: [reference, logging, kibana]
conditional: [tenant, nav]
---

# Kibana Query Language (KQL) Reference

The Kibana Query Language (KQL) is a simple text-based query language for filtering data in Kibana. You can use KQL to search for logs by message, by field, or by a combination of both.

## Operators

| Operator | Description                                                                                                                                                                                               |
| :------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `: *`    | The `: *` operator is used to search for logs where field exists. For example, `message: *` searches for logs with a message.                                                                             |
| `:`      | The `:` operator is used to search for logs by field. For example, `message: "my message"` searches for logs with the message "my message".                                                               |
| `>`, `<` | The `>` and `<` operators are used to search for logs with a field value greater than or less than a specified value. For example, `level: >"ERROR"` searches for logs with a level greater than "ERROR". |
| `AND`    | The `AND` operator is used to combine multiple conditions. For example, `message: "my message" AND level: "ERROR"` searches for logs with the message "my message" and the level "ERROR".                 |
| `OR`     | The `OR` operator is used to combine multiple conditions. For example, `message: "my message" OR level: "ERROR"` searches for logs with the message "my message" or the level "ERROR".                    |
| `NOT`    | The `NOT` operator is used to negate a condition. For example, `message: "my message" AND NOT level: "ERROR"` searches for logs with the message "my message" and not the level "ERROR".                  |

## Common fields

The following fields are common to all logs and can be used in your `KQL` query:

* `@timestamp` - The timestamp of the log event.
* `application` - The application the log event originated from.
* `cluster` - The cluster the log event originated from.
* `container` - The container the log event originated from.
* `host` - The host the log event originated from.
* `level` - The log level of the log event.
* `message` - The log message itself.
* `namespace` - The namespace the log event originated from.
* `pod` - The pod the log event originated from.
* `team` - The team who owns the application the log event originated from.

## Example queries

| Query                                                            | Description                                                                                  |
| :--------------------------------------------------------------- | :------------------------------------------------------------------------------------------- |
| `message: "my message"`                                          | Search for logs with the message "my message"                                                |
| `message: "my message" AND level: "ERROR"`                       | Search for logs with the message "my message" and the level "ERROR"                          |
| `message: "my message" OR level: "ERROR"`                        | Search for logs with the message "my message" or the level "ERROR"                           |
| `message: "my message" AND NOT level: "ERROR"`                   | Search for logs with the message "my message" and not the level "ERROR"                      |
| `message: "my message" AND level: "ERROR" AND NOT level: "WARN"` | Search for logs with the message "my message" and the level "ERROR" and not the level "WARN" |
| `message: "my message" AND level: "ERROR" OR level: "WARN"`      | Search for logs with the message "my message" and the level "ERROR" or the level "WARN"      |
