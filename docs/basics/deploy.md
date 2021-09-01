# Deploy 

_How to get team apps out to a/the cluster?_

![deployment components](/assets/deployment.png)

## Deploy-cli
The first (and probably only) component of the deploy system users will be aware of is the deploy-cli.
More often than not through a [github action](https://doc.nais.io/deployment/#deploy-with-github-actions) in their pipeline.
Users can deploy anything they want to their own namespace as long as they've got the correct deploy key, which they can fetch from [deploy.nais.io](https://deploy.nais.io/apikeys) 

## HookD
The deploy-cli communicates with a component called [Hookd](https://github.com/nais/deploy/blob/master/cmd/hookd/main.go), who validates the user's credentials and forwards the deployment request to the deploy daemon in requested cluster.

## DeployD
Each cluster has a Deploy Daemon which receive deployment requests from HookD and create the resource in the team's namespace.
DeployD also report status back to HookD on what's happening with the deployment request. This information is relayed to the deployment-cli, so the end-user gets live updates on what's happening with their deployment.

## Operators
When deployD have created a resource in the cluster, an operator will pick it up based on what kind of resource it is.
I.e. `Application` types will be picked up by [naiserator](https://github.com/nais/naiserator), `AivenApplication` by [Aivenator](https://github.com/nais/aivenator) and so forth.
All resources emits events as they progress through the various stages of creating the requested resource.
These are the events DeployD relay upstream and that in the end reach the end-user.

