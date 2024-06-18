---
tags: [reference, build, deploy]
---

# Action configuration

The available configuration options for the NAIS deploy GitHub action.

| Environment variable | Default                  | Description                                                                                                                                                                                                                 |
|:---------------------|:-------------------------|:----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| CLUSTER              | (required)             | Which NAIS cluster to deploy into.                                                                                                                                                                                          |
| DRY_RUN             | `false`                  | If `true`, run templating and validate input, but do not actually make any requests.                                                                                                                                        |
| ENVIRONMENT          | (auto-detect)          | The environment to be shown in GitHub Deployments. Defaults to `CLUSTER:NAMESPACE` for the resource to be deployed if not specified, otherwise falls back to `CLUSTER` if multiple namespaces exist in the given resources. |
| OWNER                | (auto-detect)          | Owner of the repository making the request.                                                                                                                                                                                 |
| PRINT_PAYLOAD       | `false`                  | If `true`, print templated resources to standard output.                                                                                                                                                                    |
| QUIET                | `false`                  | If `true`, suppress all informational messages.                                                                                                                                                                             |
| REF                  | `master` (auto-detect) | Commit reference of the deployment. Shown in GitHub's interface.                                                                                                                                                            |
| REPOSITORY           | (auto-detect)          | Name of the repository making the request.                                                                                                                                                                                  |
| RESOURCE             | (required)             | Comma-separated list of files containing Kubernetes resources. Must be JSON or YAML format.                                                                                                                                 |
| RETRY                | `true`                   | Automatically retry deploying if deploy service is unavailable.                                                                                                                                                             |
| TEAM                 | (auto-detect)          | Team making the deployment.                                                                                                                                                                                                 |
| TIMEOUT              | `10m`                    | Time to wait for deployment completion, especially when using `WAIT`.                                                                                                                                                       |
| VAR                  |                          | Comma-separated list of template variables in the form `key=value`. Will overwrite any identical template variable in the `VARS` file.                                                                                      |
| VARS                 | `/dev/null`              | File containing template variables. Will be interpolated with the `$RESOURCE` file. Must be JSON or YAML format.                                                                                                            |
| WAIT                 | `true`                   | Block until deployment has completed with either `success`, `failure` or `error` state.                                                                                                                                     |

Note that `OWNER` and `REPOSITORY` corresponds to the two parts of a full repository identifier.
If that name is `navikt/myapplication`, those two variables should be set to `navikt` and `myapplication`, respectively.
