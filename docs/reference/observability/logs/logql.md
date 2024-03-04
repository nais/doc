---
description: LogQL reference documentation for querying logs in Grafana Loki.
tags: [reference, loki]
---
# LogQL Reference

LogQL is the query language used in Grafana Loki to query logs. It is a powerful query language that allows you to filter, aggregate, and search for logs and should be familiar to anyone who has used SQL or [PromQL](../metrics/promql.md).

Where LogQL differs from PromQL is it's trailing pipeline syntax, or log pipeline. A log pipeline is a set of stage expressions that are chained together and applied to the selected log streams. Each expression can filter out, parse, or mutate log lines and their respective labels.

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
{app="my-app"} | json | __error__=`` | level = `error`
```

This query will:

1. Select all logs where the label `app` has the value `my-app`
2. Parse the log line as JSON
3. Filter out all formatting and parsing errors.
4. Filter out logs where the `level` field is not `error`

### Pipeline Operators

LogQL supports a set of operators for filtering and transforming logs in addition to the stream selector operators. The following operators are supported in LogQL:

- `|=` - Log line contains string
- `!=` - Log line does not contain string
- `|~` - Log line contains a match to the regular expression
- `!~` - Log line does not contain a match to the regular expression

## Reference

- [LogQL query documentation](https://grafana.com/docs/loki/latest/query/log_queries/)
- [LogQL query examples](https://grafana.com/docs/loki/latest/query/query_examples/)
