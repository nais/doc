# Teams

Access to a resource in NAIS is based on a label set on the resource called `team`. In the context of [Azure Active
Directory][AAD] a group is the same as a team, and you may already be part of a team that has applications on NAIS.

Every group in [AAD] has a so-called mailnick/tag, this is what NAIS generally uses to identify teams. When viewing
a group, the mailnick is the value before the `@` in the email field.

## Creating a new team

* To create a new team, make a pull request to the [teams repository] on Github
* The group's owners can manage the group using either [outlook] or [AAD]

## Access to Vault

In order to access _team API keys_, your team needs to be added to Vault.

Go to the [vault-iac] repository and add your team into a new file with the following contents.
You can find `name` and `group_id` on the [AAD] page. The name is the same as the _mailnick/tag_ field.

Submit your changes as a pull request and watch the [#vault-pr] Slack channel.

```
name: myteam
group_id: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```


[AAD]: https://aad.portal.azure.com/#blade/Microsoft_AAD_IAM/GroupsManagementMenuBlade/AllGroups

[outlook]: https://outlook.office365.com/owa

[teams repository]: https://github.com/navikt/teams

[All teams]: https://navno.sharepoint.com/sites/Bestillinger/Lists/Nytt%20Team/AllItems.aspx

[#nais]: https://nav-it.slack.com/messages/C5KUST8N6

[#vault-pr]: https://nav-it.slack.com/archives/CQFTZBUFN

[vault-iac]: https://github.com/navikt/vault-iac/tree/master/terraform/teams
