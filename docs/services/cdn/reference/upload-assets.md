---
tags: [cdn, upload, reference]
title: CDN Upload Action
---

This is the reference documentation for the [CDN Upload GitHub action](../how-to/upload-assets.md).

## Inputs

The action accepts the following inputs:

`team`

:   **Required**. Team name.

`source`

:   **Required**. Source directory.

`destination`

:   **Required**. Destination directory.

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

## Outputs

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

    will be available in future steps as `${{ steps.upload-cdn.outputs.uploaded }}`.
