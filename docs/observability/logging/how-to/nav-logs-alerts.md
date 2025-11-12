---
description: This guide will help you create alerts in nav-logs (OpenSearch Dashboards).
tags: [how-to, logging, opensearch, alerts]
conditional: [tenant, nav]
---
# Create alerts in nav-logs (OpenSearch Dashboards)

!!! warning "Not supported by Nais"

    This logging solution is not supported by Nais. See [Loki](./loki.md) for the new default logging solution.

This guide will help you create alerts based on your application logs in nav-logs (OpenSearch Dashboards).

## Prerequisites

- You have [enabled logging to nav-logs](./nav-logs-dashboards.md#enable-logging-to-nav-logs) for your application
- You have [access to nav-logs](./nav-logs-dashboards.md#get-access-to-nav-logs)
- You are familiar with [KQL (Kibana Query Language)](../reference/kql.md)

## Access the Alerting feature

1. Navigate to [logs.az.nav.no](https://logs.az.nav.no)
2. Select the "Nav Logs" workspace
3. Open the menu and navigate to **Alerting**

## Create a monitor

Monitors are the foundation of alerting in OpenSearch. A monitor runs queries on your logs at scheduled intervals and triggers alerts when specific conditions are met.

### Step 1: Create a new monitor

1. In the Alerting page, click **Create monitor**
2. Choose the monitor type:
   - **Per query monitor**: Triggers based on a single query result
   - **Per bucket monitor**: Triggers based on grouped results (e.g., per application, per namespace)
   - **Per document monitor**: Triggers for each document that matches your query

### Step 2: Define the monitor

1. **Monitor name**: Give your monitor a descriptive name (e.g., "High error rate for my-app")
2. **Schedule**: Set how often the monitor should run (e.g., every 5 minutes)
3. **Data source**: Select the index pattern or data view for your logs (typically `logs-*` or your team's specific index)

### Step 3: Define the query

Create a query to identify the logs you want to monitor. For example:

**Monitor for errors in your application:**

    application: "my-app" AND level: "ERROR"

**Monitor for specific error messages:**

    application: "my-app" AND message: "Database connection failed"

**Monitor for high response times:**

    application: "my-app" AND response_time: >1000

### Step 4: Set the trigger condition

Define when the monitor should trigger an alert:

1. **Trigger name**: Descriptive name for this trigger
2. **Severity level**: Choose the severity (1-5, where 1 is the highest)
3. **Condition**: Define the threshold that triggers the alert

**Examples:**

Trigger if more than 10 errors occur in the time window:

    ctx.results[0].hits.total.value > 10

Trigger if the average response time exceeds 1000ms:

    ctx.results[0].aggregations.avg_response_time.value > 1000

### Step 5: Configure actions

Actions define what happens when a trigger condition is met. You can:

- Send a notification to a Slack channel
- Send an email
- Create a webhook notification
- Execute a custom action

#### Slack notification example

1. Click **Add action**
2. Select **Slack** as the destination
3. Configure the Slack webhook (you'll need to create a Slack app with incoming webhooks)
4. Customize the message using Mustache templates:

        Alert: {{ctx.monitor.name}}
        Severity: {{ctx.trigger.severity}}
        Number of errors: {{ctx.results.0.hits.total.value}}
        Time: {{ctx.periodEnd}}

## Best practices

- **Use descriptive names**: Make it clear what the alert is monitoring
- **Set appropriate thresholds**: Avoid alert fatigue by setting meaningful thresholds
- **Test your monitors**: Use the preview feature to test your query before creating the monitor
- **Use aggregations**: For performance, aggregate data rather than monitoring individual documents when possible
- **Set the right frequency**: Balance between timely alerts and system load
- **Group related monitors**: Use naming conventions to organize monitors by team or application

## Example: Monitor for application errors

Here's a complete example of monitoring error logs for your application:

1. **Monitor name**: `my-app-error-rate`
2. **Schedule**: Every 5 minutes
3. **Query**:

        application: "my-app" AND level: "ERROR" AND namespace: "myteam"

4. **Trigger condition**:

        ctx.results[0].hits.total.value > 5

5. **Action**: Send Slack notification to `#my-team-alerts`
6. **Message**:

        ⚠️ High error rate detected in my-app

        Error count: {{ctx.results.0.hits.total.value}}
        Time window: Last 5 minutes
        Environment: {{ctx.results.0.hits.hits.0._source.cluster}}

        View logs: https://logs.az.nav.no

## Troubleshooting

### Monitor not triggering

- Verify your KQL query returns results in the Discover view
- Check that the time range in your monitor matches when logs are available
- Ensure the trigger condition threshold is set correctly

### Too many alerts

- Increase the threshold value
- Increase the monitor frequency interval
- Add more specific filters to your query
- Consider using aggregation to reduce noise

### Missing notifications

- Verify your notification destination is configured correctly
- Check that the action is enabled in your trigger
- Ensure webhook URLs or email addresses are correct

## Related documentation

- [Get started with nav-logs](./nav-logs-dashboards.md)
- [KQL Reference](../reference/kql.md)
- [Loki alerts](./logs-metrics-alerts.md) (recommended alternative)
