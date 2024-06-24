---
title: Content Delivery Network Reference
tags: [cdn, reference]
---

# Content Delivery Network reference

This is the reference documentation for the [CDN](../README.md) service.

## CDN Deploy Action

Reference documentation for the [CDN GitHub action](https://github.com/nais/deploy/blob/master/actions/cdn-upload/v2/action.yaml).

### Inputs

The action accepts the following inputs:

`team`

:   **Required**. Team name.

`source`

:   **Required**. Source directory.

`destination`

:   **Required**. Destination directory.

`project_id`

:   **Required**. Set this to `${{ vars.NAIS_MANAGEMENT_PROJECT_ID }}`.

`identity_provider`

:   **Required**. Set this to `${{ secrets.NAIS_WORKLOAD_IDENTITY_PROVIDER }}`.

`tenant`

:   **Optional**. Tenant name.

    Default value: `"nav"`

`source_keep_parent_name`

:   **Optional**. Keep the parent directory name in the destination path.

    Default value: `true`

`cache_invalidation`

:   **Optional**. Invalidate cached content after upload.

    Default value: `false`

    This is an asynchronous operation and may take up to 15 minutes after the action has run.
    Invalidation is intended for use in exceptional circumstances, not as part of your normal workflow.

    See also [Google's documentation on best practices for cache invalidation](https://cloud.google.com/cdn/docs/best-practices#invalidation).

`no_cache_paths`

:   **Optional**. Comma separated list of paths that should not be cached.

    Default value: `<empty>`

### Outputs

`uploaded`

:   List of successfully uploaded files.
    
    Available as `${{ steps.<job-id>.outputs.uploaded }}`
    For example:

    ```yaml
    - id: 'upload-cdn'
      name: Upload static files to NAV CDN
      uses: nais/deploy/actions/cdn-upload/v2@master
      ...
    ```

    will be available in future steps as `${{ steps.upload-cdn.outputs.uploaded }}`
