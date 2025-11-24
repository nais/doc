---
description: This guide will help you get started with nav-logs (OpenSearch Dashboards).
tags: [how-to, logging, opensearch]
conditional: [tenant, nav]
---
# Get started with nav-logs

!!! warning "Not supported by Nais"

    This logging solution is not supported by Nais. See [Loki](./loki.md) for the new default logging solution.

This guide will help you get started sending application logs to nav-logs (OpenSearch) and writing queries to search for logs in OpenSearch Dashboards.

## Enable logging to nav-logs

nav-logs (OpenSearch) can be enabled by setting the list of logging destinations in your nais application manifest.

???+ note ".nais/application.yaml"
    ```yaml hl_lines="6"
    …
    spec:
      observability:
        logging:
          destinations:
            - id: elastic
    ```

## Get access to nav-logs

In order to get access to logs.az.nav.no you need to have the correct access rights added to your AD account. This can be requested through your Personnel Manager.

These permissions will give you access:

```text
0000-GA-Logganalyse
0000-GA-Logganalyse_FullVerdikjede_Prod
0000-GA-Logganalyse_FullVerdikjede_UTQ
```

## Working with nav-logs

When you open nav-logs (OpenSearch Dashboards), you will see a page with a search bar. This is the query bar, and it is used to search for logs. You can use the query bar to search for logs by message, by field, or by a combination of both.

The query language is called [Kibana Query Language](../reference/kql.md) (`KQL`). KQL is a simplified version of Lucene query syntax. You can use KQL to search for logs by message, by field, or by a combination of both.

There is also a time picker in the upper right corner of the page. You can use the time picker to select a time range to search for logs. The default time range is the last 15 minutes. If no logs shows up, try to increase the time range.
