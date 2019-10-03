# Teams

In NAIS access to a resource are based on a label set on the resource called `team`.

## Creating a new team

* To create a new team, use this [Sharepoint form](https://navno.sharepoint.com/sites/Bestillinger/)
* The group's owner\(s\) can manage the group using either [outlook](https://outlook.office365.com/owa) or [AAD](https://aad.portal.azure.com/#blade/Microsoft_AAD_IAM/GroupsManagementMenuBlade/AllGroups)

Notice that once the group is created, you will get a mailnick/tag, where the team title is converted into lowercased version, with whitepaces and special characters are removed. We also recoomend to avoid the prefix `team` in your team name.

This is what you will use as your team's `label` in all NAIS-contexts.

## Machine user

Teams that are still using internal Jenkins can ask for a machine user to connect to Kubernetes and access their resources. Notify @nais-team in [#nais](https://nav-it.slack.com/messages/C5KUST8N6) and ask for one. We need to know `team`, and `clusters`.
