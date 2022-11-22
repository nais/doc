# Teams

Access to a resource in NAIS is based on a label set on the resource called `team`.
In the context of [Azure Active Directory](https://aad.portal.azure.com/#blade/Microsoft_AAD_IAM/GroupsManagementMenuBlade/AllGroups) a group is the same as a team, and you may already be part of a team that has applications on NAIS.

Every group in [AAD](https://aad.portal.azure.com/#blade/Microsoft_AAD_IAM/GroupsManagementMenuBlade/AllGroups) has a so-called mailnick/tag, this is what NAIS generally uses to identify teams.
When viewing a group, the mailnick is the value before the `@` in the email field.

## Creating a new team

* To create a new team, make a pull request to the [teams repository](https://github.com/navikt/teams) on Github
* The group's owners can manage the group using either [outlook](https://outlook.office365.com/owa) or [AAD](https://aad.portal.azure.com/#blade/Microsoft_AAD_IAM/GroupsManagementMenuBlade/AllGroups)
* The following resources will be generated for the new team:

![The sequence diagram shows the following sequence: 1. The team adds an entry to teams.yaml in the navikt/teams repository 2. An Azure AD group is created for the team 3. The group is added to the AAD application Google Suit Provisioning and synchronized to Google IAM 4. Google projects gets created for each team (dev and prod), An example shows a project, with name: team-x, access: team-x@nav.no, Resources: bucket, database 5. A namespace is created for each team in each cluster (dev and prod), with ties to the teams Google project. An example shows a namespace, with name: team-x, RBAC: team-x@nav.no, resources; project x, Arrows connects “project-x” to the resources in the example in step 4, which was bucket and database. 6. The team´s group is added to the AAD application GitHub and gets synchronized to GitHub 7. A GitHub team is provisioned for each team 8. A deployment token is generated for each team](../assets/nais-teams.png)

* An Azure AD group is created, and can be viewed in the [My Groups portal](https://account.activedirectory.windowsazure.com/r#/groups)
* A [GitHub team](https://github.com/orgs/navikt/teams) is created.
* Deploy keys are created, and can be obtained in the [NAIS deploy frontend](https://deploy.nais.io/).
* GCP users are provisioned, and users can log in to the [Google Cloud Console](https://console.cloud.google.com/) using their NAV e-mail address.
* Two GCP projects are provisioned, one for development and one for production. See `https://console.cloud.google.com/home/dashboard?project=<(dev|prod)-yourteamname>`.
* Namespaces are provisioned in all Kubernetes clusters.

## Managing your team

* Team members are managed by managing the group in [My Groups portal](https://account.activedirectory.windowsazure.com/r#/groups)

!!! warning
    It is the responsibility of each team to keep the group member roster up to date. This includes removing former team members in a timely fashion.


## Access to API keys

In order to access _team API keys_, go to [deploy.nais.io](https://deploy.nais.io/). Here you will find API keys for all teams you are a member of.

### Rotate API key

Go to [deploy.nais.io](https://deploy.nais.io/) and click on the "Rotate key" button, a pop-up will ask you to confirm the rotation.

## Team namespaces

Team namespaces are supported in both on-prem and in GCP. Refer to the [team namespaces documentation](../clusters/team-namespaces.md) for details.

## GCP Team projects

Each team has their own [Google Cloud Platform project](https://cloud.google.com/storage/docs/projects), which consist of:

* a set of users,
* a set of APIs,
* in addition to authentication and monitoring settings of those APIs.

These projects are managed through [Google Cloud Console](https://console.cloud.google.com/).
   
So, for example, all of your Cloud Storage buckets and objects, along with user permissions for accessing them, reside in a project.

In general every member of the team has the possibility to add the necessary permissions they need via [IAM role managment](https://console.cloud.google.com/iam-admin/iam).
There is no general limitation as to which features/products that can be used in a project, but everyone needs to conduct [platform risk assessment (ROS)](https://doc.nais.io/legal/nais-ros/).
While we encourage the teams to base their ROS(s) and data protection impact assessments (DPIA / PVK) on the ones done by the NAIS team, each team is responsible to do their own necessary ROS and PVK aimed for their usage/feature not covered by existing ROS.

Remember to clean up after yourself, so that NAV doesn't unnecessarily pay for resources.
Each team has a dashboard where they can visualise and monitor their product performance. [View team dashboards.](https://datastudio.google.com/u/1/reporting/417b0a1d-b307-4a6d-a699-77a6ab239661/page/mJdmB) We also have a [dashboard showing all our GCP projects.](https://datastudio.google.com/reporting/fda5f821-caef-4056-9356-9aa4f7082699/page/mJdmB)

Nais recommends that teams use Terraform, or similar technologies, to control the lifecycle of resources created in team-projects. This is more important in production, for services that will run for a longer period of time, than ad-hoc experimentation in dev. 

### Access management

To promote autonomous teams, teams control access to their own projects completely by themselves.
This can be done either by pipeline, or manually adding access when needed.

There are different scenarios for when and how to give access to users, and the official [Google Cloud Docs](https://cloud.google.com/iam/docs/granting-changing-revoking-access) is definitively the best source for information.

Google Docs has a list of possible [predefined roles](https://cloud.google.com/iam/docs/understanding-roles#predefined_roles) that we recommend using.
These roles can also be listed our with `gcloud iam roles list --filter $resource`.

Running the command without the `--filter` argument will return a very long list.

#### Temporary access

On a general basis, access should not be permanent.
A good habit is to only grant your self or other a temporary access.

Using the following `gcloud`-cli command will grant a user 1 hours of access to `roles/cloudsql.instanceUser`:
```bash
gcloud projects add-iam-policy-binding <PROJECT_ID> --member=user:<FIRSTNAME>.<LASTNAME>@nav.no --role=roles/cloudsql.instanceUser --condition="expression=request.time < timestamp('$(date -v '+1H' -u +'%Y-%m-%dT%H:%M:%SZ')'),title=temp_access"
```

There is more information over at [Google Cloud Docs](https://cloud.google.com/iam/docs/configuring-temporary-access).

#### Examples

!!! Info "Access to Postgres"
    We have a separate guide for how to give your self temporary access to a Postgres database. Head on over to [persistence/postgres](../../persistence/postgres/#granting-temporary-personal-access).

Underneath we have outlined two typical use cases for when you need to give your self or someone else access.
Do get a better understanding of how to give and revoke access with `gcloud`, you should read [Granting, changing, and revoking access to resources
](https://cloud.google.com/iam/docs/granting-changing-revoking-access).

##### How to give your self access

To be able to run this commando, you first need to find your `PROJECT_ID`, and the specific `ROLE_NAME` you want access to. To adhere to the principle of using temporary access, the example below will give access to `ROLE_NAME` for 1 hour.
```bash
gcloud projects add-iam-policy-binding <PROJECT_ID> --member=user:<FIRSTNAME>.<LASTNAME>@nav.no --role=<ROLE_NAME> --condition="expression=request.time < timestamp('$(date -v '+1H' -u +'%Y-%m-%dT%H:%M:%SZ')'),title=temp_access"
```

As an example, if you'd want to view your team's Storage buckets, you'll need the `roles/storage.objectViewer` role.
It's always smart to only give out [temporary access](#temporary-access).

This can also be leveraged to give a user belonging to a different team access to _your_ team's resources.

##### How to give a service account access

A service account is also a `--member` of a project, but instead of running the command mentioned in [How to give your self access](#how-to-give-your-self-access), you change `--member=user:<email>` to `--member=serviceAccount:<email>`.

#### GCP IAM recommender

Sometimes you might end up giving more (a wider) access than strictly necessary - but fear not!
GCP has an IAM recommender which will monitor each access permission given, and compare it to accesses actually asked for (or required).
After which the IAM recommender will recommend a more granular access, that probably fits you and your usage better!
Read more about the IAM recommender over at [Google Cloud Docs](https://cloud.google.com/iam/docs/recommender-overview).
