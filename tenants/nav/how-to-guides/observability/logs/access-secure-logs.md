# Access secure logs

Once everything is configured, your secure logs will be sent to the `tjenestekall-*` index in kibana. To gain access to these logs, you need to do the following:

## 1 Create an AD-group

To make sure you gain access to the proper logs, you need an AD-group connected to the nais-team. So the first thing you do is create this group.

Go to [Porten (service desk)](https://jira.adeo.no/plugins/servlet/desk/portal/542) and click `Melde sak til IT`. The follow the template below.
For IT to be able to correctly add the group to Remedy you need to specify the four digit department code for those who can be able to ask for permission to the group. E.g 2990 is the four digit code for the department IT-AVDELINGEN. If you are creating secure logs for your team and are unsure about which department your colleagues belong to then you can use [Delve](https://eur.delve.office.com/) to search for their profile. In their profile their department code will also be visible.

You can paste the template below into Jira:

```text
Ønsker å få opprettet en AD-gruppe for å få tilgang til sikker logg i Kibana for applikasjoner knyttet til <your project here>.

Gruppenavn: 0000-GA-SECURE_LOG_<SOMETHING>

Beskrivelse: Tilgang til secureLog for Team <team name> i Kibana.

Kryss i identrutinen: Ja

Den må inn i Remedy.
Enheter i Nav som skal ha tilgang: <four digit department code>. E.g (2990 - IT-AVDELINGEN)
```

![ticket](../../assets/jira_secure_log.png)

## 2 Connect the AD group to your team in Kibana

The logs your apps produces are linked with your [nais-team](../../team.md).
Administrators of Kibana will create a role for your team with read rights to those logs.
Whoever is in the AD-group (created in step 1) will get the Kibana role, and can thus read all logs produced by apps belonging to the nais-team.

Ask in the [#atom](https://nav-it.slack.com/archives/C7TQ25L9J) Slack channel to connect the AD-group (created in step 1) to your nais-team.

## 3 Put people into the AD-group

This must be done by "identansvarlig". For NAV-IT employees, this is `nav.it.identhandtering@nav.no`. Send them an email and ask for access with a CC to whoever is your superior.

For everyone else, the team lead or who ever is their superior should know.

## What can go wrong?

Basically, the one thing that can go wrong here is that the AD-group is not registered in "identrutinen". If this happens, the group cannot be found by "identansvarlig". If this happens, make a new JIRA-ticket to the same people and tell them to transfer the group. Sadly this can take a few days.
