---
description: LogQL reference documentation for querying logs in Grafana Loki.
tags: [reference, loki, logging]
---
# LogQL Reference

LogQL is the query language used in Grafana Loki to query logs. It is a powerful query language that allows you to filter, aggregate, and search for logs and should be familiar to anyone who has used SQL or [PromQL](../../metrics/reference/promql.md).

Where LogQL differs from PromQL is it's trailing pipeline syntax, or log pipeline. A log pipeline is a set of stage expressions that are chained together and applied to the selected log streams. Each expression can filter out, parse, or mutate log lines and their respective labels.

## Labels and Fields

Labels are key-value pairs that are associated with log streams. They are used to identify and filter logs based on specific criteria. Labels are defined when logs are ingested into Loki and cannot be changed later. Common examples of labels include `service_name`, `service_namespace`, a full list can be found on the [Loki Label Reference](./loki-labels.md) page.

Fields, on the other hand, are key-value pairs that are extracted from the log lines themselves. They are not predefined and can be dynamically parsed from the log content using LogQL expressions. Fields are often used to filter and manipulate log data within a query.

## Syntax

A LogQL query is composed by two main parts: the **stream selector** (the query) and the **log pipeline** (the transformation).

```logql
{label="value"} | stage1 | stage2 | stage3
```

### Stream Selector

The stream selector is used to select logs based on their labels. The stream selector is a set of label-value pairs that are used to filter logs. For example:

```logql
{label="value"}
```

This will return all logs where the label `label` has the value `value`. LogQL refer to this as the stream selector.

#### Selector Operators

Similar to PromQL, LogQL supports a set of operators for comparing labels and values:

- `=~` - Regular expression match
- `!~` - Regular expression mismatch
- `=` - Label value match
- `!=` - Label value mismatch
- `>` - Greater than (numeric)
- `<` - Less than (numeric)

### Log Pipeline

The log pipeline is a set of stage expressions that are chained together and applied to the selected log streams. Each expression can filter out, parse, or mutate log lines and their respective labels.

Consider the following example:

```logql
{service_name="my-app"} | json | __error__=`` | level = `error`
```

This query will:

1. Select all logs where the label `service_name` has the value `my-app`
2. Parse the log line as JSON
3. Filter out all formatting and parsing errors.
4. Filter out logs where the `level` field is not `error`

### Pipeline Operators

LogQL supports a set of operators for filtering and transforming logs in addition to the stream selector operators. The following operators are supported in LogQL:

- `|=` - Log line contains string
- `!=` - Log line does not contain string
- `|~` - Log line contains a match to the regular expression
- `!~` - Log line does not contain a match to the regular expression

### Filter Fields

```logql
{service_name="my-app"} | json | __error__=`` | my_field = `my_value`
```

In the example above, `my_field` is a field in the log line that is being filtered by the value `my_value`. This is a common pattern in LogQL queries.

## Reference

- [LogQL query documentation](https://grafana.com/docs/loki/latest/query/log_queries/)
- [LogQL query examples](https://grafana.com/docs/loki/latest/query/query_examples/)
