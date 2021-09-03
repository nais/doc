### Clusters

In ye olde days of yore, NAVs security model was based on network segmentation and zones.

## FSS
Many of our older systems, and systems with a high degree of sensitive content were placed in a dedicated zone with very strict restrictions: Fagsystemsone (FSS).
Connectivity to and from this zone is very limited - no connectivity to the internet, inbound connections have to go through security gateways. However - connectivity inside this zone is not restricted in any way, shape or form. Everyone can connect with everyone else - like a true hippie community. (As many of these applications were written in the seventies, it sort of makes sense)

## SBS
There came a day when NAV discovered something called "the Internet", and that this was something we could use to provide the population with services directly.
This created the demand for a separate zone, as allowing traffic from the internet directly in to our hippie community called FSS seemed unwise.
Thus Selvbetjeningssonen (SBS) was born.
SBS is less restricted than FSS and applications have access to the internet (almost) - and can be exposed to the internet as well.
However - since most of NAVs data reside in FSS, most applications in SBS rely on data from FSS to be able to do anything meaningful.
In order to get the data they need they have to jump through several burning rings of fire, pray to the almighty DataPower-gods and perform several ancient rites and rituals.

![zones](/assets/zones.png)

## NAIS on-premises
When we started building NAIS, we built it to exist in this world, and have separate clusters in each of these two zones.
We further divided our clusters in to development and production clusters to maintain a healthy separation.
Thus the four clusters we've got on-premises are: `dev-fss`, `dev-sbs`, `prod-fss` and `prod-sbs` (and a fifth called nais-ci, but that's just for us to test stuff)

## NAIS GCP
Luckily the world has moved on from zones and segmentation.
When we built NAIS in GCP we wanted the applications to be able to communicate without jumping over hurdles and figured we'd adopt a [zero-trust-model](https://doc.nais.io/appendix/zero-trust/), where applications specify with whom they want to communicate, and who is allowed to communicate with them in their application manifest.
And so the two GCP clusters `dev-gcp` and `prod-gcp` was born.
There are a couple of additional clusters in GCP as well, though - `ci-gcp` for us to test changes and `labs-gcp` where the teams can experiment.

![clusters](/assets/clusters.png)

## Access from laptop

In the extended NAIS universe we also have a component called naisdevice. This is a cross plattform mechanism that provices access to NAIS services. The product adheres to the same principles as are decribed [here](https://honest.security) and 