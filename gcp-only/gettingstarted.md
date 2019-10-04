# Getting started on GCP

Although our GCP clusters are built and ready for action - there are still quite a few rough edges and quite a few strikk and binders based solutions to contend with.
As we're ironing out these querks, GCP is not considered GA.
We ask that anyone experimenting with GCP at this stage exhibit extraordinary amounts of patience and goodwill.

## Access
In GCP the primary unit of access is a team, whose origin is a group in Azure AD.
Each team is given its own namespace where they will have unrestricted access to all kubernetes assets.

### Creating a new team
The current method for creating an Azure AD group is using a [sharepoint form](https://navno.sharepoint.com/sites/Bestillinger/Lists/Nytt%20Team/AllItems.aspx)
Once the group has been created, a willing and able soul will have to patch it to make it securityEnabled. (Christer)
A securityEnabled group can be manually added to the Azure Enterprise Application `Google Suite Provisioning`, which in turn will synchronize the group and its members to Google, creating the neccessary Google IAM objects. (Frode)
The team's owner can maintain the group's members using office 369.

### Creating a team namespace
In order to create a namespace for the new team, the teamname (the same as the mail of the Azure AD group i.e `teamname`@nav.no) is added to vars/<cluster>/teams.yaml in the nais-yaml repository.
In addition to creating the namespace, nais-yaml will create default network polices, add ca-bundle and annotate the namespace for [rbac-sync](https://github.com/nais/rbac-sync)

### Accessing the clusters
Once your group has been synchronized to Google IAM, you should be able to authenticate to gcloud and get kubeconfigs following these [instructions](https://doc.nais.io/access)

## Administrative hurdles
All applications are required to have a PVK (Personvernskonsekvensutredning) wheter they run on GCP or not.
This is an absolute demand for running your application in GCP.
If your application hasn't got one already, get in touch with Leif Tore Løvmo.
