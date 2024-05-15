---
tags:
- cdn
- reference
---

# Content Delivery Network Reference

This is the reference documentation for the [CDN](../explanation/cdn.md) service.

## How-to guides

- :dart: [Upload assets to the CDN](../how-to-guides/cdn.md)

## CDN Deploy Action

Reference documentation for the [CDN GitHub action](https://github.com/nais/deploy/blob/master/actions/cdn-upload/v2/action.yaml).

### Inputs

The action accepts the following inputs:

| input                   | description                                                | default | required |
|-------------------------|------------------------------------------------------------|---------|----------|
| team                    | Team name                                                  | ❌      | true     |
| source                  | Source directory                                           | ❌      | true     |
| destination             | Destination directory                                      | ❌      | true     |
| project_id              | Should be `${{ vars.NAIS_MANAGEMENT_PROJECT_ID }}`         | ❌      | true     |
| identity_provider       | Should be `${{ secrets.NAIS_WORKLOAD_IDENTITY_PROVIDER }}` | ❌      | true     |
| tenant                  | Tenant name                                                | `"nav"` | false    |
| source_keep_parent_name | Keep parent directory name when uploading                  | `true`  | false    |
| cache_invalidation      | Invalidate cached content after upload                     | `false` | false    |
| no_cache_paths          | Comma separated list of paths that should not be cached    | `""`    | false    |

### Outputs

#### `uploaded`

List of successfully uploaded files.

Available as `${{ steps.<job-id>.outputs.uploaded }}`

For example:

```yaml
- id: 'upload-cdn'
  name: Upload static files to NAV CDN
  uses: nais/deploy/actions/cdn-upload/v2@master
  ...
```

will be available in future steps as `${{ steps.upload-cdn.outputs.uploaded }}`
