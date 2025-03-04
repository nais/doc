---
conditional: [tenant, nav]
---

# Responsibilities - Nais and teams

"Nais" is a term that denotes a set of services offered by the nais team which the product teams can use when building their products.
The nais services are built on infrastructure and underlying services offered by different infrastructure teams and cloud platform vendors.
In general, responsibilities for services are separated along these lines:

- Cloud platform vendors are responsible for keeping the infrastructure and underlying platforms running.
- The Nais team is responsible for ensuring the Nais services are up and running and available for use by the product teams.
- The product teams are responsible for their own applications (including business logic, code, data, etc) and for how they use the Nais services.

As a **general rule** the lines of ownership goes along the project lines. The services running in team-projects are the responsibility of the team. Thus the nais-team owns the usage of cloud services running in the nais-project such as Kubernetes, load-balancing, DNS etc. 

What constitutes a Nais service, an underlying service or what is owned by a product team varies from case to case.
In some instances, the product team is a user of common resources owned by the nais team (e.g. the Grafana stack, or the underlying Kubernetes clusters).
In these cases the nais team operates the resources and is responsible for the service availability.
In other cases the product teams provision their own resources directly from the underlying vendors.
