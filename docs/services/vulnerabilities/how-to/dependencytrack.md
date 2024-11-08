---
tags: [ dependencytrack, how-to ]
---

# Dependencytrack

You can access the Dependency-track user interface through the following URL:

https://salsa.[tenant].cloud.nais.io

In Dependency-track, each image in a deployment or job is linked to its own project.
A project can be associated with multiple workloads, teams, and clusters.
The project name is based on the image name. For Google Artifact Registry (GAR),
the project name follows this format: `europe-north1-docker.pkg.dev/nais-management-233d/[team]/[application]`,
with the image version set as the project version.

[Dependency-track](https://dependencytrack.org/) has a ton of features so check out
the [documentation](https://docs.dependencytrack.org/) for more information.