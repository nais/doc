# Getting started on GCP

{% hint style="danger" %}
Although our Google Cloud Platform (GCP) clusters are built and ready for action, there are still quite a few rough
edges and quite a few makeshift solutions to contend with. As we're ironing out these quirks, GCP is not considered
generally available for use.

We ask that anyone experimenting with GCP at this stage exhibit extraordinary amounts of patience and goodwill.
{% endhint %}

## Access
On GCP the primary unit of access is a *team*, whose origin is a group in Azure AD. Each team is given its own
namespace. The team will have unrestricted access to all Kubernetes assets in that namespace.

### Creating a new team

See [Teams] for instructions to create a new team on Azure AD. To use GCP, a few additional measures have to be taken.

* Once the group has been created, a willing and able soul will have to patch it to make it `securityEnabled`. ([Christer Edvartsen])
* A `securityEnabled` group can be manually added to the Azure Enterprise Application `Google Suite Provisioning`, which in turn will synchronize the group and its members to Google, creating the necessary Google *Identity & Access Management* (IAM) objects. ([Frode Sundby])
* The team's owner can maintain the group's members using Office 365.

### Creating a team namespace

In order to create a namespace for the new team, the team's mailnick/tag (see [Teams]) must be added as an entry to
`teams` in `vars/<cluster>/teams.yaml` in [nais-yaml]. In addition to creating the namespace, nais-yaml will create
default network polices, add ca-bundle and annotate the namespace for [rbac-sync].

### Accessing the clusters

Once the group has been synchronized to Google IAM, group members should be able to authenticate with `gcloud` by
following the instructions specific to GCP in [Access].

## Administrative hurdles

All applications are required to have a PVK (Personvernskonsekvensutredning) whether they run on GCP or not. This is an
absolute demand for running your application in GCP. If your application does not have one already, get in touch with
[Leif Tore Løvmo].

[Teams]: ../basics/teams.md
[nais-yaml]: https://github.com/navikt/nais-yaml
[rbac-sync]: https://github.com/nais/rbac-sync
[Access]: ../basics/access.md#google-cloud-platform-gcp
[Christer Edvartsen]: https://nav-it.slack.com/messages/DDE0P7EA3
[Frode Sundby]: https://nav-it.slack.com/messages/D8QRAFZPT
[Leif Tore Løvmo]: https://nav-it.slack.com/messages/DB4DDCACF
