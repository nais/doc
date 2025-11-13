---
description: This guide will help you create alerts in nav-logs (OpenSearch Dashboards).
tags: [how-to, logging, opensearch, alerts]
conditional: [tenant, nav]
---
# Create alerts in nav-logs (OpenSearch Dashboards)

!!! warning "Not supported by Nais"

    This logging solution is not supported by Nais. See [Loki](./loki.md) for the new default logging solution.

This guide will help you create alerts based on your application logs in nav-logs (OpenSearch Dashboards).

Alerting in OpenSearch consists of two main components: **notification channels** (where alerts are sent) and **monitors** (what triggers the alerts). You must create a notification channel before you can create a monitor.

## Prerequisites

- You have [enabled logging to nav-logs](./nav-logs-dashboards.md#enable-logging-to-nav-logs) for your application
- You have [access to nav-logs](./nav-logs-dashboards.md#get-access-to-nav-logs)
- You have a Slack webhook URL ready

## Step 1: Create a notification channel

Before you can receive alerts, you need to create a notification channel. This defines where your alerts will be sent (e.g., Slack, email, webhook).

### Access notification channels

1. Navigate to [logs.az.nav.no](https://logs.az.nav.no)
2. Open the menu and navigate to **Notifications** → **Channels**
3. Or go directly to the [Channels page](https://logs.az.nav.no/app/notifications-dashboards#/channels)

### Create a new channel

1. Click **Create channel**
2. **Name**: Give your channel a descriptive name (e.g., "my-team-slack-alerts")
3. **Channel type**: Select **Slack**
4. **Slack webhook URL**: Paste your Slack incoming webhook URL
    - To create a webhook: Go to your Slack workspace → Apps → Incoming Webhooks
    - Configure which channel receives notifications and copy the webhook URL
5. Click **Create**

<!-- Screenshot placeholder: Creating a Slack notification channel -->

!!! tip "Test your channel"
    Use the "Send test message" button to verify the channel works before creating monitors.

## Step 2: Create a monitor

Monitors run queries on your logs at scheduled intervals and trigger alerts when conditions are met.

### Access monitors

1. Navigate to [logs.az.nav.no](https://logs.az.nav.no)
2. Open the menu and navigate to **Alerting** → **Monitors**
3. Click **Create monitor**

<!-- Screenshot placeholder: Monitors list page -->

### Configure monitor basics

1. **Monitor name**: Give your monitor a descriptive name (e.g., "BO accounting reporting")
2. **Monitor type**: Select **Per query monitor** (most common for log monitoring)
3. **Monitor definition**: Select **Visual editor**
4. **Schedule**: Set how often to check (e.g., every 5 minutes)

<!-- Screenshot placeholder: Monitor details section -->

### Define what to monitor

1. **Index**: Select `logs-*` or your specific index pattern
2. **Time field**: Select `@timestamp`
3. **Define using**: Add filters to match your logs

**Query examples:**

    application: "my-app" AND level: "ERROR"
    application: "my-app" AND message: "Database connection failed"
    namespace: "myteam" AND level: "ERROR"

<!-- Screenshot placeholder: Query definition -->

!!! tip
    Test your query in Discover first to ensure it returns the expected results.

## Step 3: Create triggers

Triggers define the conditions that cause your monitor to send an alert and specify which notification channel to use.

## Step 3: Create triggers

Triggers define when to send alerts and to which channel.

### Add a trigger

1. Click **Add trigger**
2. **Trigger name**: Describe the condition (e.g., "High error rate")
3. **Severity level**: Select 1-5 (1 is highest priority)
4. **Trigger condition**: Define when to alert

**Common conditions:**

    ctx.results[0].hits.total.value > 10    # More than 10 errors
    ctx.results[0].hits.total.value > 0     # Any errors found
    ctx.results[0].hits.total.value == 0    # No logs found (missing expected events)

<!-- Screenshot placeholder: Trigger condition -->

### Configure notification

1. Click **Add action**
2. **Action name**: e.g., "Notify team Slack"
3. **Destination**: Select your notification channel
4. **Message**: Customize the alert content

**Example message:**

    ⚠️ Alert: {{ctx.monitor.name}}

    Found {{ctx.results.0.hits.total.value}} errors
    Time: {{ctx.periodStart}} to {{ctx.periodEnd}}

    View logs: https://logs.az.nav.no

**Useful variables:**

- `{{ctx.monitor.name}}` - Monitor name
- `{{ctx.trigger.name}}` - Trigger name
- `{{ctx.results.0.hits.total.value}}` - Number of matches
- `{{ctx.periodStart}}` / `{{ctx.periodEnd}}` - Time period

<!-- Screenshot placeholder: Action configuration -->

### Enable throttling (optional)

To prevent alert spam:

- **Throttling**: Enable and set time window (e.g., 10 minutes)
- This limits how often notifications are sent

<!-- Screenshot placeholder: Throttling -->

### Save

Click **Create** to save your monitor. It will start running on the schedule you defined.

## Complete example

Here's a quick example monitoring for missing accounting reports:

**Notification channel:**
- Name: `bo-team-slack`, Type: Slack

**Monitor:**
- Name: `BO accounting reporting`
- Type: Per query monitor
- Schedule: Every 5 minutes
- Query: `application: "bo-accounting" AND message: "accounting report sent"`

**Trigger:**
- Name: `BO does not send accounting`
- Condition: `ctx.results[0].hits.total.value == 0` (alerts when no logs found)
- Action: Send to `bo-team-slack`

## Troubleshooting

**Monitor not triggering:**
- Test your query in Discover first
- Check the time range covers when logs appear
- Verify the trigger condition is correct

**No notifications received:**
- Test the notification channel with "Send test message"
- Check the channel is selected in the action
- Verify throttling isn't blocking notifications

**Too many alerts:**
- Increase the trigger threshold
- Enable throttling to limit notification frequency
- Make your query more specific

## Related documentation

- [Get started with nav-logs](./nav-logs-dashboards.md)
- [KQL Reference](../reference/kql.md)
- [Loki alerts](./logs-metrics-alerts.md) (recommended alternative)

## Step 4: Save the monitor

1. Review your monitor configuration
2. Click **Create** to save the monitor
3. The monitor will start running on the schedule you defined

<!-- Screenshot placeholder: Save/Create button -->

For more detailed information about monitors, see the [OpenSearch Alerting documentation](https://docs.opensearch.org/latest/observing-your-data/alerting/monitors/).

## Complete example: Monitoring for missing reports

Here's a complete example of monitoring for missing accounting reports:

## Complete example

Here's a complete example of monitoring for missing accounting reports:

### Notification channel

- **Name**: `bo-team-slack`
- **Type**: Slack
- **Webhook URL**: `https://hooks.slack.com/services/YOUR/WEBHOOK/URL`

### Monitor configuration

- **Monitor name**: `BO accounting reporting`
- **Monitor type**: Per query monitor
- **Method**: Visual editor
- **Schedule**: By interval, every 5 minutes
- **Index**: `logs-*`
- **Time field**: `@timestamp`

### Query

    application: "bo-accounting" AND message: "accounting report sent"

### Trigger

- **Trigger name**: `BO does not send accounting`
- **Severity**: 1 (Highest)
- **Condition**: `ctx.results[0].hits.total.value == 0`
  - This triggers when NO logs are found (meaning the report wasn't sent)

### Action

- **Action name**: `Notify BO Slack`
- **Destination**: `bo-team-slack`
- **Message**:

        ⚠️ BO Accounting Alert

        No accounting reports were detected in the last 5 minutes.

        Monitor: {{ctx.monitor.name}}
        Trigger: {{ctx.trigger.name}}
        Time: {{ctx.periodStart}} to {{ctx.periodEnd}}

        Expected log message not found: "accounting report sent"

        View logs: https://logs.az.nav.no

- **Throttling**: Enabled for 10 minutes

This monitor will check every 5 minutes for the presence of accounting report logs, and alert if none are found.

## Best practices

- **Create notification channels first**: Always set up your notification channels before creating monitors
- **Use descriptive names**: Make it clear what the alert is monitoring (both for channels and monitors)
- **Test your queries**: Use the Discover view to test queries before adding them to monitors
- **Set appropriate thresholds**: Avoid alert fatigue by setting meaningful trigger conditions
- **Use throttling**: Prevent duplicate notifications by enabling action throttling
- **Start with low frequency**: Begin with longer intervals (e.g., 10-15 minutes) and adjust based on needs
- **Group by team**: Use naming conventions to organize channels and monitors by team
- **Document your alerts**: Add clear descriptions to monitors explaining what they detect and why

## Troubleshooting

### Monitor not triggering

- Verify your query returns results in the Discover view
- Check that the time range covers the period when logs should appear
- Ensure the trigger condition threshold is set correctly
- Use "Preview query and graph" to see what data the monitor evaluates
- Verify the monitor is enabled and not paused

### Notifications not received

- Verify the notification channel is configured correctly
- Test the channel using the "Send test message" feature
- Check that the channel is selected in the monitor's action
- Ensure the action is enabled in the trigger configuration
- For Slack: Verify the webhook URL is correct and the webhook is active
- Check if throttling is preventing notifications

### Too many alerts

- Increase the trigger condition threshold
- Increase the monitor check frequency (run less often)
- Enable or adjust action throttling to reduce notification frequency
- Add more specific filters to your query to reduce false positives
- Review if the severity level is appropriate

### Query performance issues

- Use more specific index patterns instead of `logs-*`
- Reduce the time range for each check
- Avoid overly complex queries with many conditions
- Consider using aggregations instead of document-level queries

## Related documentation

- [Get started with nav-logs](./nav-logs-dashboards.md)
- [KQL Reference](../reference/kql.md)
- [OpenSearch Notifications documentation](https://docs.opensearch.org/latest/observing-your-data/notifications/index/)
- [OpenSearch Alerting documentation](https://docs.opensearch.org/latest/observing-your-data/alerting/monitors/)
- [Loki alerts](./logs-metrics-alerts.md) (recommended alternative)
