# Change team on already deployed application without downtime

This section applies when you get the following error when deploying:

> "tobac.nais.io" denied the request: user 'system:serviceaccount:default:serviceuser-FOO' has no access to team 'BAR'

To change which team owns an application you must use `kubectl` and change the team label for the application.
Deploying with the new team will not work if there exists an Application with the old team label set.

The easiest way to do this is:

  0. The user performing these actions must be a member of both the old and new team
  1. `kubectl edit application <name>`
  2. edit `.metadata.labels.team` to the name of the new team
  3. save and close
