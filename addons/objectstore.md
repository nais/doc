---
description: >
  Objectstore is a storage solution based on the AWS S3 api and is used for persistent storage. 
---

# Objectstore / S3

objectstore on NAIS stores files in buckets. On-prem uses rook ceph storage nodes as the storage solution. This is persistent storage and available in all clusters. The preferred solution is to use GCP for both applications and buckets, but it is supported on-prem as well.

The objectstore / S3 bucket access is secured with access keys and secret keys stored in kubernetes.

## How to

### Ceph object storage user

On NAIS on-prem you're required to add a ceph object storage user. This is done through nais-yaml. After applying changes to the ceph-users.yaml and applying this to the cluster the rook operator will create the necessary secrets used to access the S3 bucket.
Contact [@Sten.Ivar.Røkke] for access or create a pull-request in [navikt/nais-yaml].

Example yaml for ceph user:

ceph-user.yaml
```yaml
apiVersion: ceph.rook.io/v1
kind: CephObjectStoreUser
metadata:
  name: example-application
  namespace: rook-ceph
spec:
  store: objectstore
  displayName: "example-application"
```

After a few minutes the rook operator in the cluster will create the secret. 
The keys necessary can then be fetched and stored in vault for mounting and usage runtime for the application. Contact [@Sten.Ivar.Røkke] or other nais team members for keys. 

The objectstore service endpoint is http://objectstore.rook-ceph.svc.nais.local.
The objectstore can also be reached from other clusters using https://objectstore.nais.{domain name}.

## Metrics

General ceph metrics are available from several dashboards in grafana:

[Grafana Ceph Cluster]

[Grafana Ceph OSD]

## Code examples

Kotlin objectstore / S3 bucket access:

```kotlin
package no.nav.example

import com.amazonaws.auth.AWSStaticCredentialsProvider
import com.amazonaws.auth.BasicAWSCredentials
import com.amazonaws.client.builder.AwsClientBuilder
import com.amazonaws.services.s3.AmazonS3
import com.amazonaws.services.s3.AmazonS3ClientBuilder
import com.amazonaws.services.s3.model.CannedAccessControlList
import com.amazonaws.services.s3.model.CreateBucketRequest
import com.amazonaws.services.s3.model.PutObjectResult
import com.amazonaws.services.s3.transfer.TransferManager
import com.amazonaws.services.s3.transfer.TransferManagerBuilder
import java.io.File
import org.slf4j.LoggerFactory

object S3Client {

    private val s3: AmazonS3
    private val log = LoggerFactory.getLogger(javaClass)

    init {
        val ev = EnvVarFactory.envVar
        val credentials = BasicAWSCredentials(ev.s3AccessKey, ev.s3SecretKey)
        log.info("New Client: (host: " + ev.s3Url + " - " + ev.s3Region + ", accesskey-length: " + ev.s3AccessKey.length + "S3 secret key Length: " + ev.s3SecretKey.length)
        s3 = AmazonS3ClientBuilder.standard()
            .withEndpointConfiguration(AwsClientBuilder.EndpointConfiguration(ev.s3Url, ev.s3Region))
            .enablePathStyleAccess()
            .withCredentials(AWSStaticCredentialsProvider(credentials))
            .build()
        createBucketIfMissing()
    }

    fun persistToS3(file: File): PutObjectResult {
        return s3.putObject(Const.BUCKET, Const.FILE, file)
    }

    fun loadFromS3(): File {
        val tempFile = createTempFile()
        transferManager()
            .download(Const.BUCKET, Const.FILE, tempFile)
            .waitForCompletion()
        return tempFile
    }

    private fun createBucketIfMissing() {
        val bucketList = s3.listBuckets().filter { b -> b.name == Const.BUCKET }
        if (bucketList.isEmpty()) {
            log.info("Creating new bucket as its missing: " + Const.BUCKET)
            s3.createBucket(CreateBucketRequest(Const.BUCKET).withCannedAcl(CannedAccessControlList.Private))
        }
        if (!s3.doesObjectExist(Const.BUCKET, Const.FILE)) {
            log.info("Creating empty file for persisting what have been pushed: " + Const.FILE)
            s3.putObject(Const.BUCKET, Const.FILE, "")
        }
    }

    private fun transferManager(): TransferManager {
        return TransferManagerBuilder.standard().withS3Client(s3).build()
    }

}
```

Feel free to help us out by adding more examples!

[@Sten.Ivar.Røkke]: https://nav-it.slack.com/archives/D5KP2068Z
[navikt/nais-yaml]: https://github.com/navikt/nais-yaml.git
[Grafana Ceph Cluster]: https://grafana.adeo.no/d/vwcB0Bzml/ceph-cluster?orgId=1&refresh=10s
[Grafana Ceph OSD]: https://grafana.adeo.no/d/Fj5fAfzik/ceph-osd?orgId=1&refresh=15m
