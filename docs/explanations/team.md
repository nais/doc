---
tags: [explanation, nais, team]
---

# What is a team?

Everything in Nais is organized around the concept of a _team_.

A Nais team should consist of technical personnel involved with developing and operating the team's workloads and resources.

Being member of a team grants you full access to the team's workloads and provisioned resources.
Limit access to the people that actually need it according to the _principle of least privilege_.

## The anatomy of a team

A team consists of one or more _users_. The team has at least one `owner` and can have multiple `members`.

An `owner` can add, remove, and change the roles of other users on the team.

A user can be part of multiple teams.

## What happens when you create a team?

When you [create a team](../operate/how-to/create-team.md), the following will be provisioned for you:

- An isolated area for your team's workloads and resources in each environment (e.g. `dev` and `prod`)
- A GitHub team with the same name in your GitHub organization. The members of your Nais team will be synchronized with the GitHub team.
- Roles and permissions to access the teams workloads and resources.

The creator of a team is automatically granted `owner` privileges for the team.
