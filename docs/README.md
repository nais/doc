---
ᴴₒᴴₒᴴₒ: false
---
# It is NAIS to be a developer at NAV

<div class="grid cards" markdown>

-   :octicons-repo-24:{ .lg .middle } **Your first application**

    ---

    Set up your very first NAIS application with a simple `nais.yaml` file.

    [:octicons-arrow-right-24: Getting started](/basics/application)

-   :octicons-rocket-24:{ .lg .middle } **Deploy in minutes**

    ---

    Get your application up and running in minutes with GitHub Actions.

    [:octicons-arrow-right-24: Deployment](/deployment/)

-   :octicons-graph-24:{ .lg .middle } **Know what's going on**

    ---

    Observe everything that happens in your application with Prometheus and Grafana.

    [:octicons-arrow-right-24: Observability](/observability/)

-   :octicons-heart-24:{ .lg .middle } **We got your back!**

    ---

    We have assembled the best tips and tricks to help you succeed.

    [:octicons-arrow-right-24: Good practices](/nais-application/good-practices)

</div>

## Why NAIS exists

When you have a large development organisation, providing the developers with turn-key solutions for their most common needs is a good investment.

### "Swiss Army Knife"

At the core of NAIS lies [*Kubernetes*](https://kubernetes.io), which can be described as a Swiss army knife of tools. Each of these tools comes with its own set of instructions and in sum this adds up and makes for a bit of a mess in terms of choices and considerations.

Our goal is to lift this burden from our developers, and in order to do so we've condensed the essential parts into a single configuration file that we use to generate all the underlying Kubernetes resources. In NAIS terms this file is most commonly referred to as [`nais.yaml`](./nais-application/example/)

![A swiss army knife with the nais logo. All the tools are opened and it looks like a mess.](assets/nais_army_knife.png)

The services included are (but not limited to) logging, metrics, alerts, deployment, operators and a runtime environment (across on-premise and Google Cloud Platform).

To make this all happen we leverage open source projects best suited to our needs and provide them with usable abstractions, sane defaults and the required security hardening.

## Clusters

In ye olde days of yore, NAVs security model was based on network segmentation and zones. (And if we are being honest this still holds true for parts of our operation). Our goal (and strategy) however is to move everything to "Public Cloud". So anything described as on-prem is scheduled to be taken out behind the barn at some point and new apps, services or products are destined to exist in GCP (for now).

### NAIS on-premises (FSS)

Many of our older systems, and systems with a high degree of sensitive content were placed in a dedicated zone with very strict restrictions: Fagsystemsone (FSS).
Connectivity to and from this zone is very limited - no connectivity to the internet, inbound connections have to go through security gateways. However - connectivity inside this zone is not restricted in any way, shape or form. Everyone can connect with everyone else - like a true hippie community. (As many of these applications were written in the seventies, it sort of makes sense)

We further divided our clusters in to development and production clusters to maintain a healthy separation.
Thus the two clusters we've got on-premises are: `dev-fss` and `prod-fss` (and a third called nais-ci, but that's just for us to test stuff)

### NAIS in GCP

Luckily the world has moved on from zones and segmentation.
When we built NAIS in GCP we wanted the applications to be able to communicate without jumping over hurdles and figured we'd adopt a [zero-trust-model](https://doc.nais.io/appendix/zero-trust/), where applications specify with whom they want to communicate, and who is allowed to communicate with them in their application manifest.
And so the two GCP clusters `dev-gcp` and `prod-gcp` were born.
There are a couple of additional clusters in GCP as well, though - `ci-gcp` for us to test changes and `labs-gcp` where the teams can experiment.

[:octicons-arrow-right-24: Get started with Google Cloud](/clusters/gcp/)

![The on-prem zone consist of the two clusters dev-sbs and prod-sbs, that are now retired, and dev-fss and prod-fss. There are two GCP clusters, dev-gcp and prod-gcp. The illustration repeats the text, and uses a horrible, romantic font that makes the designers gasp for air.](assets/clusters.png)

## For Application Teams

NAIS is for the application teams.

We believe that a team should be able to take full responsibility for what they build - in the entirety of its lifecycle.
This creates better software and happier teams.

To achieve this, we ensure that each team has their own space where they can experiment, develop and host the stuff they build.
Here they have the full set of permissions, and are only limited by their own imagination.

You can also learn about our [user management and permissions](basics/teams).

## Access Your Applications

In the extended NAIS universe we also have a component called [naisdevice][./device]. This is a cross-platform mechanism that provices access to NAIS services. The product adheres to the [Honest.security principles](https://honest.security) and takes aim at securing our operations without getting in your way.

## Contact the NAIS team

The team can be found on [Slack](https://nav-it.slack.com/messages/C5KUST8N6/).
Also, follow us on [Twitter @nais\_io](https://twitter.com/nais_io)!
