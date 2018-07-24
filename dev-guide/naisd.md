Naisd
=====

> Naisd is the golden path to continous delivery on the nais platform. It provides developers with a simple API to deploy their applications based on a minimalistic deployment yaml.

We expose Naisd in each cluster for deploments of application to that specific cluster. The end point is formatted like  https://daemon.{cluster.domain}/deploy (e.g. https://daemon.nais.preprod.local/deploy).


## /deploy

The endpoint accepts HTTP POST payloads in JSON, with the following values:

```json
{
  "application": "appname",
  "version": "1",
  "zone": "fss",
  "fasitEnvironment": "t0",
  "fasitUsername": "brukernavn",
  "fasitPassword": "passord",
}
```

We recommend performing deployments to one or more environments in your applications build/release pipeline. This can be done by using cURL like this:

```
curl -k -d '{"application": "appname", "version": "1", "fasitEnvironment": "t0", "zone": "fss", "environment": "default", "fasitUsername": "brukernavn", "fasitPassword": "passord"}' https://daemon.nais.devillo.no/deploy
```


### Values

#### environment

```json
"environment": "app-environment"
```

If you need multiple different [application instances](/dev-guide/service_discovery) running at the same time, you can specify the environment with the `environment` key in the JSON payload. Default value is `app`.

To communicate with other applications in the cluster, use `http://{app-environment}.{applicationName}/`.


#### Skip Fasit

```json
"skipFasit": true
```

Use `skipFasit` if your app is running without getting resources or other configurations from Fasit. Default value is `false`.


#### External or non-default manifest address

```json
"manifesturl": "https://path.to.manifest"
```

The default [NAIS manifest](/contracts/README.md#nais-manifest) URL is [repo.adeo.no](https://repo.adeo.no/), which is our internal [Nexus](/dev-guide/nexus.md).

Values are set as following:
```text
groupid=nais
artifactid=<appname>
version=<version>
type=yaml
```


## /deploystatus

To supplement the [/deploy](/dev-guide/naisd.md#deploy) endpoint, there is another endpoint for checking the status of the deployment.

The endpoint accepts HTTP GET on the path `/deploystatus/{environment}/{application}/`.

The response will be the deployment status payload from Kubernetes with the following HTTP status code mappings:

| HTTP status | Meaning     |
| ----------- | ----------- |
| 200         | done        |
| 202         | in progress |
| 500         | failed      |


### Example payload

```json
{
  "Name": "appname",
  "Desired": 2,
  "Current": 2,
  "UpToDate": 2,
  "Available": 2,
  "Containers": ["appname"],
  "Images": ["navikt/appname:version"],
  "Status": "Success",
  "Reason": "deployment \"appname\" successfully rolled out."
}
```

## /delete

We are also working on a delete-endpoint, for delete complete apps. For now it is a bit buggy, and so we also recommend running the Kubectl-operations.

### Kubectl operation

```operations
$ kubectl delete deployment,ingress,service,secrets,serviceaccount,horizontalpodautoscaler <appname>
```


## Deploy annotations

For each deploy, Naisd post the application, version, cluster, and namespace, to Influxdb, through [Sensu](/contracts/metrics#push-metrics).

You can use the SQL below to show annotations i a Grafana-dashboard:

```sql
SELECT "version" FROM "naisd.deployment" WHERE "clusterName" = '$datasource$' AND "application" =~ /^$app$/ AND "namespace" =~ /^$namespace$/ AND $timeFilter
```


## Issues and suggestions

If you have some issues or suggestions for Naisd you can make an [issue on Github](https://github.com/nais/naisd/issues) or [contacts us](/#contact-us) directly.


## Flow

![overview](/_media/naisd_overview.png)
