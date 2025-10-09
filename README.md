# Welcome to the Nais documentation

See the [Nais handbook](https://handbook.nais.io/technical/doc-guidelines/) for a more detailed explanation of the documentation structure and how to contribute.

## Tools for working with tenants

### Warning about features not available in test-nais

If a page should have a warning about not being available in test-nais, add the following near the top of the page:

```markdown
<<not_in_test_nais("Name of feature")>>
```

### Exclude a full page from one or more tenants documentation

Add the following to the frontmatter of the page:

```yaml
conditional: [not-test-nais, not-nav]
```

### Include a page only for one or more tenants

Add the following to the frontmatter of the page:

```yaml
conditional: [tenant, nav, ssb]
              ^^^^^^--- the keyword "tenant" is required to exclude all not mentioned
```

## Local development

## 1. Install Poetry

```bash
asdf plugin add poetry
asdf install poetry latest
```

## 2. Install dependencies

```bash
make install
```
## 3. Serve the documentation locally

```bash
make local
```

## 3a. Serve a tenant-specific version of the documentation

```bash
TENANT=nav make local
```

## 3b. Do a clean build of the documentation

```bash
make clean-build
```
