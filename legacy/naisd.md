Naisd
=====

> Naisd is the golden path to continous delivery on the nais platform. It provides developers with a simple API to deploy their applications based on a minimalistic deployment yaml.

We expose Naisd in each cluster for deployments of application to that specific cluster. The end point is formatted like  https://daemon.{cluster.domain}/deploy (e.g. https://daemon.nais.preprod.local/deploy).


## /deploy

The endpoint accepts HTTP POST payloads in JSON, with the following values:

```json
{
  "application": "appname",
  "version": "1",
  "zone": "fss",
  "fasitEnvironment": "t1",
  "fasitUsername": "username",
  "fasitPassword": "password",
}
```

We recommend performing deployments to one or more namespaces in your applications build/release pipeline. This can be done by using cURL like this:

```
curl -k -d '{"application": "appname", "version": "1", "fasitEnvironment": "t0", "zone": "fss", "namespace": "default", "fasitUsername": "brukernavn", "fasitPassword": "passord"}' https://daemon.nais.devillo.no/deploy
```


### Values

#### namespace

```json
"namespace": "app-namespace"
```

If you need to run your application in multiple namespaces you can specify `namespace` key in the JSON payload. Default value is `default`.

To communicate with other applications in the cluster, use `http://{applicationName}/`. If you want to communicate with an application in another namesace you can postfix the url with the namespace: `http://{applicationName}.{namespace}/`
For more information on how service discovery works in kubernetes, check out the [official documentation](https://kubernetes.io/docs/concepts/services-networking/dns-pod-service/).


#### Skip Fasit

```json
"skipFasit": true
```

Use `skipFasit` if your app is running without getting resources or other configurations from Fasit. Default value is `false`.


#### External or non-default manifest address

```json
"manifesturl": "https://path.to.manifest"
```

The default [NAIS manifest](/documentation/contracts/README.md#nais-manifest) URL is [repo.adeo.no](https://repo.adeo.no/), which is our internal [Nexus](/../nexus.md).

Values are set as following:
```text
groupid=nais
artifactid=<appname>
version=<version>
type=yaml
```


## /deploystatus

To supplement the [/deploy](#deploy) endpoint, there is another endpoint for checking the status of the deployment.

The endpoint accepts HTTP GET on the path `/deploystatus/{namespace}/{application}/`.

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


## Delete application

When using Naisd, the only way to remove your application is to use the delete-endpoint. This will remove all the Kubernetes resources made for your application.

### Delete endpoint

The endpoint accepts HTTP DELETE on the path `/app/{namespace}/{application}`  (e.g. https://daemon.nais.preprod.local/app/default/example-app).

Possible HTTP status codes:

| HTTP status | Meaning     |
| ----------- | ----------- |
| 200         | done        |
| 500         | failed      |

The response payload will be the deletion status of all application components:

| Status | Meaning                        |
| ------ | ------------------------------ |
| OK     | Resource deleted               |
| N/A    | Component not found            |
| FAIL   | Some unexpected error occured  |


### Example payload

```
result:
service: OK
deployment: OK
redis: N/A
secret: OK
ingress OK
autoscaler: OK
alert rules: OK
service account: OK
```


## Deploy annotations

For each deploy, Naisd post the application, version, cluster, and namespace, to Influxdb, through [Sensu](/../metrics/metrics.md#push-metrics).

You can use the SQL below to show annotations i a Grafana-dashboard:

```sql
SELECT "version" FROM "naisd.deployment" WHERE "clusterName" = '$datasource$' AND "application" =~ /^$app$/ AND "namespace" =~ /^$namespace$/ AND $timeFilter
```


## Issues and suggestions

If you have some issues or suggestions for Naisd you can make an [issue on Github](https://github.com/nais/naisd/issues) or [contacts us](../README.md#contact-us) directly.


## Flow

![overview](../.gitbook/assets/naisd_overview.png)
