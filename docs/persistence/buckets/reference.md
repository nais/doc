---
title: Buckets reference
tags: [reference, bucket]
---

# Buckets reference

## Backup of a bucket 

There is no automatic backup enabled for buckets. I.e. the files can not be restored in the event of accidental deletion or storage system failure.

### Specification

 * `retentionPeriodDays` is set in number of days, if not set; no retention policy will be set and files can be deleted by application or manually.

 * `lifecycleCondition` can be set to verify which files/objects are subject to permanent deletion based on the conditions set.
     * `age` specifies days it has existed in the bucket before it can be deleted.
     * `createdBefore` specifies a date all files created before this date can be deleted.
     * `numNewerVersions` specifies the number of revisions that must be kept, all older revisions can be deleted.
     * `withState` specifies which state (LIVE, ARCHIVED, ANY) the object must have before being subject to permanent deletion.

        The latter two are subject to object versioning being set on objects, as unversioned objects do not have multiple versions and have state value LIVE.
