---
tags:
  - CDN
---

# CDN

Reference documentation for the [CDN](../explanation/workloads/cdn.md) deploy action.

## Inputs

The action accepts the following inputs:

| input              | description                                             | default | required |
|--------------------|---------------------------------------------------------|---------|----------|
| team-name          | Team name                                               | ❌       | true     |
| destination        | Destination directory                                   | ❌       | true     |
| source             | Source directory                                        | ❌       | true     |
| cache-invalidation | Invalidate cached content after upload                  | `false` | false    |
| no-cache-paths     | Comma separated list of paths that should not be cached | `""`    | false    |

## Outputs

### `uploaded`

List of successfully uploaded files.

Available as `${{ steps.<job-id>.outputs.uploaded }}`

For example:

```yaml
- id: 'upload-cdn'
  name: Upload static files to NAV CDN
  uses: navikt/frontend/actions/cdn-upload/v2
  ...
```

will be available in future steps as `${{ steps.upload-cdn.outputs.uploaded }}`
