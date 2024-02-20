# CDN

The cdn deploy action accepts a few different inputs

## Action Inputs

| input                         | description                                             | required | default      |
|-------------------------------|---------------------------------------------------------|----------|--------------|
| team-name                     | CDN team name                                           | true     | X            |
| destination                   | Destination directory                                   | true     | x            |
| source                        | Source Directory                                        | true     | x            |
| environment                   | CDN environment name (cdn.dev.nav.no or cdn.nav.no)     | false    | "cdn.nav.no" |
| source-keep-parent-name       | Keep parent directory name when uploading               | false    | true         |
| cache-invalidation            | Optionally invalidate cached content after upload       | false    | false        |
| cache-invalidation-background | Run cache invalidation in the background                | false    | true         |
| no-cache-paths                | Comma separated list of paths that should not be cached | false    | ""           |
