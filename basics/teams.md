# Teams

Access to a resource in NAIS is based on a label set on the resource called `team`. In the context of [Azure Active
Directory][AAD] a group is the same as a team, and you may already be part of a team that has applications on NAIS.

Every group in [AAD] has a so-called mailnick/tag, this is what NAIS generally uses to identify teams. When viewing
a group, the mailnick is the value before the `@` in the email field.

## Creating a new team

* To create a new team, use this [Sharepoint form]
* The group's owners can manage the group using either [outlook] or [AAD]

Note that when the group is created, the mailnick/tag will be generated from the team name. It is converted into
a lowercased version with whitepaces and special characters removed. Although technically perfectly fine, it is
recommended to avoid the prefix `team` in the team name; it is superfluous in configurations: `team: teamred`

## Access to Vault

In order to access _team API keys_, your team needs to be added to Vault.

Go to the [vault-iac] repository and add your team into a new file with the following contents.
You can find `name` and `group_id` on the [All teams] page. The name is the same as the _mailnick/tag_ field.

Submit your changes as a pull request and watch the [#vault-pr] Slack channel.

```
name: myteam
group_id: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```


[AAD]: https://aad.portal.azure.com/#blade/Microsoft_AAD_IAM/GroupsManagementMenuBlade/AllGroups

[outlook]: https://outlook.office365.com/owa

[Sharepoint form]: https://navno.sharepoint.com/sites/Bestillinger/

[All teams]: https://navno.sharepoint.com/sites/Bestillinger/Lists/Nytt%20Team/AllItems.aspx

[#nais]: https://nav-it.slack.com/messages/C5KUST8N6

[#vault-pr]: https://nav-it.slack.com/archives/CQFTZBUFN

[vault-iac]: https://github.com/navikt/vault-iac/tree/master/terraform/teams
