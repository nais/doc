# Change team on already deployed application without downtime

This section applies when you get the following error when deploying:

> "tobac.nais.io" denied the request: user 'system:serviceaccount:default:serviceuser-MYTEAM' has no access to team 'OTHERTEAM'

To change which team owns an application you must use `kubectl` and change the team label for the application.
Deploying with the new team will not work if there exists an Application with the old team label set.

The easiest way to do this is with this one-liner. The user running the command must be a member of both the old and new team.

```
kubectl patch app MYAPPLICATION --type merge --patch '{"metadata":{"labels":{"team":"MYTEAM"}}}'
```
