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
recommended to avoid the prefix `team` in the team name; it seems a bit superfluous in configurations: `team: teamred`

## Machine user

Teams that are still using internal Jenkins can ask for a machine user to connect to Kubernetes and access their
resources. Notify @nais-team in [#nais] and ask for one. We need to know the `team` name, and for which Kubernetes
clusters access is required.

[AAD]: https://aad.portal.azure.com/#blade/Microsoft_AAD_IAM/GroupsManagementMenuBlade/AllGroups

[outlook]: https://outlook.office365.com/owa

[Sharepoint form]: https://navno.sharepoint.com/sites/Bestillinger/

[#nais]: https://nav-it.slack.com/messages/C5KUST8N6
