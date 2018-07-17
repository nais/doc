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
  "environment": "default",
  "fasitEnvironment": "t0",
  "fasitUsername": "brukernavn",
  "fasitPassword": "passord",
}
```

We recommend performing deployments to one or more environments in your applications build/release pipeline. This can be done by using cURL like this:

```
curl -k -d '{"application": "appname", "version": "1", "fasitEnvironment": "t0", "zone": "fss", "environment": "default", "fasitUsername": "brukernavn", "fasitPassword": "passord"}' https://daemon.nais.devillo.no/deploy
```

### Skip Fasit

```json
"skipFasit": true # defaults to false
```

If your app is running without getting resources or other configurations from Fasit, you can skip the whole Fasit connection with `skipFasit: true`.


### External or non-default manifest address

```json
"manifesturl": "https://path.to.manifest"
```

The default [NAIS manifest](/contracts/manifest) URL is [repo.adeo.no](https://repo.adeo.no/), which is our internal Nexus.

Values are set as following:
```text
groupid=nais
artifactid=<appname>
version=<version>
type=yaml
```


## /deploystatus

To supplement the [/deploy](/deployment#deploy) endpoint, there is another endpoint for checking the status of the deployment.

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


## Issues and suggestions

If you have some issues or suggestions for Naisd you can make an [issue on Github](https://github.com/nais/naisd/issues) or [contacts us](//#contact-us) directly.


## Flow

![overview](/_media/naisd.png)
