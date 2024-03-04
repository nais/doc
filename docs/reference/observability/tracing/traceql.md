---
description: TraceQL reference documentation for querying traces in Grafana Tempo.
tags: [reference, tempo]
---
# TraceQL Reference

TraceQL is the query language used in Grafana Tempo to query traces. It is a powerful query language that allows you to filter, aggregate, and search for traces and should be familiar to anyone who has used SQL or [PromQL](../metrics/promql.md).

Where TraceQL differs from PromQL is it's trailing pipeline syntax, or trace pipeline. A trace pipeline is a set of stage expressions that are chained together and applied to the selected trace data. Each expression can filter out, parse, or mutate trace spans and their respective labels.

## Syntax

A TraceQL query is composed by two main parts: the **trace span selector(s)** (the query) and the **trace pipeline** (aggregations).

```traceql
{label="value"} | stage1 | stage2 | stage3
```

### Trace Span Selector

The trace span selector is used to select spans based on their attributes. It is a set of key-value pairs that are used to filter spans.

Some span metadata are intrinsic to the span, such as `name`, `status`, `duration`, and `kind`, while others (attributes and resources) are user-defined, such as `service.name`, `db.operation`, and `http.status_code`.

```traceql
{ span.http.status_code >= 200 && span.http.status_code < 300 }
```

#### Comparison Operators

Similar to PromQL, TraceQL supports a set of operators for comparing span attributes and values. One notable difference is type coercion, where the type of the attribute is inferred from the value being compared.

- `=` - Equality
- `!=` - Inequality
- `>` - Greater than
- `>=` - Greater than or equal to
- `<` - Less than
- `<=` - Less than or equal to
- `=~` - Regular expression
- `!~` - Negated regular expression

#### Combining spansets

Since a trace can be composed of multiple spans, multiple selectors can be used together to filter spans based on different attributes.

TraceQL supports two types of combining spansets: logical (`&&` and `||`) and structural relations (`>`, `>\>`, `<\<` `<`, and `~`).

##### Logical

The logical operators `&&` and `||` are used to combine spansets based on their attributes.

```traceql
{ resource.service.name="server" } && { resource.service.name="client" }
```

The above query will return traces where a span with the service name `server` and a differ3ent span with the service name `client` are present.

##### Structural

Structural relations are used to filter spans based on their structural relationships. The structural relations are:

- `>` - Direct parent of
- `>\>` - Ancestor of
- `<\<` - Descendant of
- `<` - Direct child of
- `~` - Sibling of

For example, to find a trace where a specific HTTP request interacted with a particular kafka topic, you could use the following query:

```traceql
{ span.http.url = "/path/of/api" } >> { span.messaging.destination.name = "my-team.some-topic" }
```

### Trace Pipeline Aggregations

To further refine the selected spans, a trace pipeline can be used to apply a set of aggregation functions on the selected spans.

- `count` - The count of spans in the spanset.
- `avg` - The average of a given numeric attribute or intrinsic for a spanset.
- `max` - The max value of a given numeric attribute or intrinsic for a spanset.
- `min` - The min value of a given numeric attribute or intrinsic for a spanset.
- `sum` - The sum value of a given numeric attribute or intrinsic for a spanset.

We can use the `count()` function to count the number of spans in the selected traces. In the following example, we select traces that contains more then 3 database SELECT operations:

```traceql
{span.db.operation="SELECT"} | count() > 3
```

## Reference

- [TraceQL query documentation](https://grafana.com/docs/tempo/latest/traceql/)
- [Get to know TraceQL](https://grafana.com/blog/2023/02/07/get-to-know-traceql-a-powerful-new-query-language-for-distributed-tracing/)
