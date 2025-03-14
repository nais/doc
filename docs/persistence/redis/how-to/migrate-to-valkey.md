---
tags: [valkey, redis, how-to, migrate]
---

# Migrate to Valkey

If you need to keep the data and your application needs to be available during the migration, reach out to the nais team for assistance.

## Prerequisites

- Your app uses Redis for a simple caching store and can handle the data missing at startup.

## Variants

The steps to migrate differ depending on how your Redis instance has been created:

1. You created the Redis instance implicitly by adding a `redis` block to your application manifest.
2. You created the Redis instance explicitly by creating a `Redis` resource.

### Implicit Redis instance

If you created the Redis instance implicitly by adding a `redis` block to your application manifest, follow these steps:

1. Copy the `redis` block in your application manifest to use `valkey` instead. The fields are the same.
2. Deploy the updated application manifest.

   Your application is now using Valkey instead of Redis.
3. Prepare Redis for deletion:

   `kubectl patch redis redis-<TEAM-NAME>-<INSTANCE-NAME> --type json -p='[{"op": "replace", "path": "/spec/terminationProtection", "value": false}]'`

4. Remove the `redis` block from your application manifest and deploy the updated manifest.

   The Redis instance will now be deleted.
5. Congrats! Your application now uses Valkey instead of Redis.

### Explicit Redis instance

If you created the Redis instance explicitly by creating a `Redis` resource, follow these steps:

1. Make a copy of your Redis manifest to hold your Valkey manifest.
2. Update `kind` from `Redis` to `Valkey`.
3. Change the name from `redis-<TEAM-NAME>-<INSTANCE-NAME>` to `valkey-<TEAM-NAME>-<INSTANCE-NAME>`.
4. Deploy the manifest.
5. For each application that uses this Redis instance:
   1. Change the `redis` block in the application manifest to use `valkey` instead. The fields are the same.
   2. Deploy the updated application manifest.
6. Delete the Redis manifest from source control so it doesn't get recreated.
7. Delete the old Redis instance: `kubectl delete redis redis-<TEAM-NAME>-<INSTANCE-NAME>`.
8. Congrats! Your application now uses Valkey instead of Redis.
