---
description: >-
  NAIS provides buckets for objects storage as a managed service throguh Google
  Cloud Storage. This page describes how to get started with buckets for your
  applications.
---
# Google Cloud Storage Buckets

Google Cloud Storage is a service that provides object storage. It is a very simple service that is easy to use and provides a lot of flexibility. It is a good choice for storing data that is not relational in nature.

## Getting started

You can set up a Google Cloud Storage bucket through the NAIS application manifest.

```yaml
apiVersion: "nais.io/v1alpha1"
kind: "Application"
metadata:
  name: app-a
...
spec:
  ...
  gcp:
    buckets:
      - name: mybucket
        retentionPeriodDays: 30
        lifecycleCondition:
          age: 7
          createdBefore: 2020-01-01
          numNewerVersions: 2
          withState: ANY
```

!!! info
    Once a bucket is provisioned, it will not be automatically deleted unless one explicitly sets `spec.gcp.buckets[].cascadingDelete` to `true`. This means that any cleanup must be done manually.

Bucket names must be globally unique across the entire Google infrastructure. This can cause provisioning problems if your bucket name is used by someone else.

## Bucket backup

!!! warning

    There is no automatic backup enabled for buckets.

## Specification

`retentionPeriodDays` and `lifecycleCondition` must be set when creating the bucket as they cannot be changed after the bucket is created.

 * `retentionPeriodDays` is set in number of days, if not set; no retention policy will be set and files can be deleted by application or manually from the point they are created.

 * `lifecycleCondition` can be set to verify which files/objects are subject to permanent deletion based on the conditions set.
     * `age` specifies days it has existed in the bucket before it can be deleted.
     * `createdBefore` specifies a date all files created before this date can be deleted.
     * `numNewerVersions` specifies the number of revisions that must be kept, all older revisions can be deleted.
     * `withState` specifies which state (LIVE, ARCHIVED, ANY) the object must have before being subject to permanent deletion.

        The latter two are subject to object versioning being set on objects, as unversioned objects do not have multiple versions and have state value LIVE.

## Problem solving

If you have problems getting your bucket up and running, check errors in the event log:

```bash
kubectl describe storagebucket mybucket
```

## Example application

An example application using workflow identity to access a bucket: [testapp](https://github.com/nais/testapp)

## Deleting a bucket

The bucket is not automatically removed when deleting your NAIS application.
Remove unused buckets to avoid incurring unnecessary costs.
This is done by setting [`cascadingDelete`](../nais-application/application.md#gcpbucketscascadingdelete) in your `nais.yaml`-specification, and then deleting your application resource.
