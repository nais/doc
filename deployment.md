# Deployment

In each cluster, we expose a deployment endpoint to simplify the creation of the kubernetes resources.
The endpoint is on the format https://daemon.nais.domain.tld/deploy

![overview](/_media/naisd.png)


## How

The endpoint accepts HTTP POST payloads on the following format

```deployment.json
{
  "application": "appname",      // application name
  "version": "1",                // version of your application
  "zone": "fss",                 // what zone your application runs in
  "environment": "default",      // optional: defaults to 'default'
  "fasitEnvironment": "t0",      // fasit environment 
  "fasitUsername": "brukernavn", // fasit username
  "fasitPassword": "passord",    // fasit password
  "manifesturl": "https://..."   // optional: defaults to using internal nexus with groupid=nais, artifactid=<appname>, version=<version>, type=yaml
}
``` 

We recommend performing deployments to one or more environments in your applications build/release pipeline. This can be done by using cURL like this:

```
curl -k -d '{"application": "appname", "version": "1", "fasitEnvironment": "t0", "zone": "fss", "environment": "default", "fasitUsername": "brukernavn", "fasitPassword": "passord"}' https://daemon.nais.devillo.no/deploy
```

## Deployment status
To supplement the /deploy endpoint, there is another endpoint for checking the status of the deployment. 
The endpoint accepts HTTP GET on the path /deploystatus/team/environment/yourappname/

The response will be the the deployment status payload from kubernetes with the following HTTP status code mappings:

* Done -> 200
* InProgress -> 202 
* Failed -> 500
 
## naisd

The application that performs these operations is called [naisd](https://github.com/nais/naisd) and is part of the NAIS platform applications.

![overview](/_media/gopher.png)
