# Contributing

## Process
### Fixing Issues
1. Open an Issue
2. Create a PR

### New suggestions/report errors
1. Open an Issue with proposed content
2. Optional: Come to pig-doc meeting to discuss

## Editing

### Adding a new page
- Add a new `new_page.md` under correct category that your page belongs to (inside of `docs/`).
- Update `mkdocs.yml`'s `nav` key's correct category that your page belongs to.

### Publishing a release
- Merge PR to master
- Commit directly to master

## Preview your changes
Read [README.md](README.md).

### Leveraging `mkdocs`'s `--strict` flag
`mkdocs` comes with a `--strict` flag for building (read: compiling HTML) and serving (read local-dev preview) the documentation.

To leverage the benefits of this flag, one must ensure:
- All internal references/links are relative.

### Hints and callouts

```bash
!!! info
    hint text
    ```bash
    echo "In-line code within the info panel"
    ```
```

Hints may have the following styles:

- success
- info
- warning
- danger

### Tabs

```
=== "First tab title"
Some text on first tab.
=== "Second tab title"
Some other text on second tab.

```

### Code tabs
```
=== "Minimal nais.yaml example"
    ```yaml
    apiVersion: "nais.io/v1alpha1"
    kind: "Application"
    ```
=== "Full nais.yaml example"
    ```yaml
    apiVersion: "nais.io/v1alpha1"
    kind: "Application"
    metadata:
      name: nais-testapp
      namespace: aura
      labels:
        team: aura
    spec:
      (...)
    ```

```
