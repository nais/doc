# Google Cloud Platform

## Clusters
As we have implemented [https://github.com/navikt/pig/blob/master/kubeops/doc/zero-trust.md](zero trust) networking model in GCP, there is no need for separate clusters to differentiante FSS and SBS applications.
The only thing we differentiate on a cluster level is development and production.
When building and testing applicaitons you can use the `dev-gcp`-cluster for both internal and external applications and expose them using the following ingresses:
- `*.dev-adeo.no` - will expose the application on an internal loadbalancer that is accessible from utviklerimage/VDI, clients connected to the NAV wifi, scaleFT and "Nav Skrivebord". This domain is typically used for internal "saksbehandler" applications
- `*.dev-nav.no` - will expose the application on an external loadbalancer that is accessible from utviklerimage/VDI, clients connected to the NAV wifi, scaleFT, "Nav Skrivebord" and external addresses on the public internet that have been explicitly allowed. This domain is typically used for applications exposed to citizens
- `*.dev-nais.io` - will expose the application on an internal loadbalancer that is accessible from uviklerimage/VDI, clients connected to the NAV wifi, and scaleFT. This domain is typically used for internal applications that are not indended for "saksbehandlere"

Once applications are ready for production, they can be deployed to the `prod-gcp`-cluster. The following ingress options are available:
- `*.adeo.no` - exposing the application on a loadbalancer that is accessible from utviklerimage/VDI, NAV wifi, scaleFT and "NAV skrivebord". This domain is typically used for internal "saksbehandler" applications
- `*.nav.no` - Will expose the applicaiton

All our GCP clusters are private clusters, which means that the API server is not accessible directly from the public Internet. There is instead a scaleFT server in front of each API server which makes the cluster available via Navtunnel.
