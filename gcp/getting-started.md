# Getting started

{% hint style="danger" %}
Although our Google Cloud Platform \(GCP\) clusters are built and ready for action, there are still quite a few rough edges and quite a few makeshift solutions to contend with. As we're ironing out these quirks, GCP is not considered generally available for use.

We ask that anyone experimenting with GCP at this stage exhibit extraordinary amounts of patience and goodwill.
{% endhint %}

## Access

On GCP the primary unit of access is a _team_, whose origin is a group in Azure AD. Each team is given its own namespace. The team will have unrestricted access to all Kubernetes assets in that namespace.

### Creating a new team

See [Teams](../teams.md) for instructions to create a new team on Azure AD. To use GCP, a few additional measures have to be taken.

* Once the group has been created, a willing and able soul will have to patch it to make it `securityEnabled`. \([Christer Edvartsen](https://nav-it.slack.com/messages/DDE0P7EA3)\)
* A `securityEnabled` group can be manually added to the Azure Enterprise Application `Google Suite Provisioning`, which in turn will synchronize the group and its members to Google, creating the necessary Google _Identity & Access Management_ \(IAM\) objects. \([Frode Sundby](https://nav-it.slack.com/messages/D8QRAFZPT)\)
* The team's owner can maintain the group's members using Office 365.

### Creating a team namespace

In order to create a namespace for the new team, the team's mailnick/tag \(see [Teams](../teams.md)\) must be added as an entry to `teams` in `vars/<cluster>/teams.yaml` in [nais-yaml](https://github.com/navikt/nais-yaml). In addition to creating the namespace, nais-yaml will create default network polices, add ca-bundle and annotate the namespace for [rbac-sync](https://github.com/nais/rbac-sync).

### Accessing the clusters

Once the group has been synchronized to Google IAM, group members should be able to authenticate with `gcloud` by following the instructions specific to GCP in [Access](../access.md#google-cloud-platform-gcp).

## Administrative hurdles

When moving an application to GCP, it is a great time to update its [Risikovurdering \(ROS\)](https://navno.sharepoint.com/sites/intranett-it/SitePages/Risikovurderinger.aspx) analysis. It is required to update the application's entry in the [Behandlingsoversikt](https://navno.sharepoint.com/sites/intranett-personvern/SitePages/Behandlingsoversikt.aspx) when changing platforms. If both of these words are unfamiliar to your team, it's time to sit down and take a look at both of them.

Every application needs to have an [ROS](https://navno.sharepoint.com/sites/intranett-it/SitePages/Risikovurderinger.aspx) analysis, and applications handling personal information needs a [Personvernkonsekvens \(PVK\)](https://navno.sharepoint.com/sites/intranett-personvern/SitePages/PVK.aspx) analysis, and then create an entry in the [Behandlingsoversikt](https://navno.sharepoint.com/sites/intranett-personvern/SitePages/Behandlingsoversikt.aspx). More information about [ROS](https://navno.sharepoint.com/sites/intranett-it/SitePages/Risikovurderinger.aspx), [PVK](https://navno.sharepoint.com/sites/intranett-personvern/SitePages/PVK.aspx), and [Behandlingsoversikt](https://navno.sharepoint.com/sites/intranett-personvern/SitePages/Behandlingsoversikt.aspx) can be found on our intranet. Questions about ROS can be directed to [Leif Tore Løvmo](https://nav-it.slack.com/messages/DB4DDCACF), while [Line Langlo Spongsveen](https://nav-it.slack.com/messages/DNXJ7PMH7) can answer questions about the other two.

