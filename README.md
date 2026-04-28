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

## Copilot Agents

Four agents handle documentation tasks:

```
@research-agent → @technical-writer → @plain-language-en → @docs-qa
```

- **`@research-agent`** — Investigates Nais source repos via GitHub MCP. Read-only.
- **`@technical-writer`** — Writes/edits docs following repo conventions (Diataxis, mkdocs, Jinja macros).
- **`@plain-language-en`** — Copy-edits for plain language, removes AI jargon.
- **`@docs-qa`** — Verifies docs accuracy against Nais source code. Read-only.

Start with `@research-agent` to gather context, hand off to `@technical-writer` to draft, which auto-hands off to `@plain-language-en` for polish. Then hand off to `@docs-qa` to verify accuracy against source code. Use `@docs-qa` standalone to audit any existing page.

## Local development

The documentation site lives in [`svdoc/`](./svdoc) and is built with SvelteKit + Bun. Tasks are managed with [mise](https://mise.jdx.dev/).

### 1. Install mise

Follow the [mise installation guide](https://mise.jdx.dev/getting-started.html). All other tools (such as Bun) are pinned in [`mise.toml`](./mise.toml) and installed automatically.

### 2. Install dependencies

```bash
mise run setup
```

### 3. Serve the documentation locally

```bash
mise run local
```

This installs dependencies (if needed) and starts the dev server.

### 3a. Serve a tenant-specific version of the documentation

```bash
TENANT=nav NOT_TENANT=not-nav mise run local:dev
```

### 4. Build the documentation

Build one or more tenant-specific versions into `out/<tenant>/`:

```bash
mise run build nav nav test-nais
```

### Checks and formatting

```bash
mise run check              # run lint + svelte-check
mise run check:lint         # prettier + eslint
mise run check:svelte-check # svelte-check only
mise run fmt                # format with prettier
```
