---
description: This guide will help you get started with Kibana.
tags: [observability, logs]
---
# Get started with Kibana

## Enable logging to Kibana

Kibana can be enabled by setting the list of logging destinations in your nais application manifest.

???+ note ".nais/application.yaml"
    ```yaml hl_lines="6"
    …
    spec:
      observability:
        logging:
          destinations:
            - id: loki
    ```

## Get access to Kibana

In order to get access to logs.adeo.no you need to have the correct access rights added to your AD account. This can be requested through your Personnel Manager.

These permissions will give you access:

```text
0000-GA-Logganalyse
0000-GA-Logganalyse_FullVerdikjede_Prod
0000-GA-Logganalyse_FullVerdikjede_UTQ
```

## Working with Kibana

When you open Kibana you are prompted to select a workspace, select "Nav Logs" to start viewing your application logs.

Once the page loads you will see an empty page with a search bar. This is the query bar, and it is used to search for logs. You can use the query bar to search for logs by message, by field, or by a combination of both.

The query language is called [Kibana Query Language](../../../reference/observability/logs/kql.md) (`KQL`). KQL is a simplified version of Lucene query syntax. You can use KQL to search for logs by message, by field, or by a combination of both.

There is also a time picker in the upper right corner of the page. You can use the time picker to select a time range to search for logs. The default time range is the last 15 minutes. If no logs shows up, try to increase the time range.
