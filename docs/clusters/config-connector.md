# Config-connector / CNRM in GCP

[Config-connector](https://github.com/GoogleCloudPlatform/k8s-config-connector) is a Kubernetes operator that translates Kubernetes resources into GCP resources. 

## Config-connector resource creation 
Every team namespace has its `ConfigConnectorContext` that enables the use of Config-connector. This resource is created by the platform and should not be modified.

During deployment of an `Application`, the platform will create a range of resources in Kubernetes, among them (and if requested) `SqlInstance`, `SqlDatabase`, `SqlUser` and `StorageBucket`. 

When these resources are created, Config-connector will translate them and create the equivalent GCP resources. The service accounts created in the `serviceaccounts` namespace will be granted the necessary permissions to access these resources.

### Schematic overview of resource creation
![Deployment overview including cnrm](../assets/config-connector.png)