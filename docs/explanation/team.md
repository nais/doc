# What is a team?

Everything in NAIS is organized around the concept of a team.
Nothing in NAIS is owned by an individual; the team as a whole owns the [workloads](./workloads/README.md) built by the team, as well as all provisioned resources. This is to ensure that everything can continue to operate even if someone leaves.

A NAIS team doesn't necessarily map directly to the organizational team unit, and (usually) consists of purely technical personnel developing and operating on the same set of products or services. The reason for this is that being member of a NAIS team will grant you access to all the workloads and provisioned resources that the team owns. To reduce the attack surface, it's a good idea to limit access to the people that actually need it.

To [become a member](../how-to-guides/team.md) of a NAIS team, you need to have a Google account that is a member of your organization's Google Workspace.

## The anatomy of a team

A team has two different roles, `owner` and `member`.
A team has at least one `owner`, and can have multiple `members`. The `owners` have permission to add and remove `members`, as well changing the roles of the `members`.
You can be a member and owner of multiple teams.

## What does a NAIS team provide?

When you [create a team](../how-to-guides/team.md), the following will be provisioned for you:

- An isolated area for your team's workload and resources in each environment (e.g. dev and prod)
- A GitHub team with the same name in your GitHub organization. The members of your NAIS team will be synchronized with the GitHub team.
- Roles and permissions to access the teams workloads and resources.
