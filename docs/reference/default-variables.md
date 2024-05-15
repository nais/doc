# Default variables available for Application

These environment variables will be injected into your application container

| variable | example | source |
| :--- | :--- | :--- |
| NAIS\_APP\_NAME | myapp | metadata.name from app.yaml |
| NAIS\_NAMESPACE | default | metadata.namespace from app.yaml |
| NAIS\_APP\_IMAGE | navikt/myapp:69 | spec.image from app.yaml |
| NAIS\_CLUSTER\_NAME | prod | which environment you are running in |
| NAIS\_CLIENT\_ID | prod-fss:default:myapp | concatenation of cluster, namespace and app name  |

