---
tags: [how-to, opensearch, dashboard]
---

# Get access to the dashboard

Each OpenSearch instance in Aiven comes with a built-in dashboard for visualizing your data.
To get access to this dashboard you need to follow these steps:

{%- if tenant() == "nav" %}
## Prerequisites

For production services, you need to have the `aiven-prod` gateway enabled in Naisdevice. 
This is done through [Just In Time Access (JITA)](../../../operate/naisdevice/explanations/jita.md).

{%- endif %}

## Create service account for access

1. Create a personal temporary Aiven service account using [nais-cli](../../../operate/cli/README.md).

    ```
    nais aiven create --access read --instance <name-of-instance> opensearch ignored namespace
    ```

2. Retrieve dashboard URI, username, and password using nais-cli and the command that was outputted from the last command

    ```
    nais aiven get opensearch secret-name namespace
    ```
