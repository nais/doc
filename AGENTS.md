# AGENTS.md — nais/doc

Main documentation for the Nais developer platform. Markdown sources live in
`docs/` and are rendered by a custom SvelteKit + Bun site in `svdoc/` that
preserves Material for MkDocs syntax (admonitions, tabs, `.pages` nav) plus
Jinja-style template macros using `<<` `>>` delimiters.

Audience: developers and technical users who deploy on Nais without deep
Kubernetes knowledge. Write for them.

## The one rule that matters most: Diataxis

The docs follow the [Diátaxis](https://diataxis.fr/) framework. **Every page
belongs to exactly one category. Never mix categories on a page.** This is the
rule that governs where content goes and how it reads. When a page tries to
teach, explain, and list reference facts all at once, split it.

| Category | Directory | Purpose | Tone |
| --- | --- | --- | --- |
| **Tutorial** | `tutorials/` | Learning-oriented. Guide a beginner through a complete task from start to finish. | Sequential, safe, no assumed prior knowledge beyond the tutorial's scope. Every step works. |
| **How-to guide** | `how-to/` | Task-oriented. Solve one specific problem. | Minimal actionable steps. Assume context. No background. Only the code needed. |
| **Explanation** | `explanations/` | Understanding-oriented. The "why". | Clarify concepts and design decisions. Don't duplicate steps from guides. |
| **Reference** | `reference/` | Information-oriented. Facts only. | Tables, schemas, CLI flags. No narrative, no instructions. |

Category directories nest under topic areas, e.g. `docs/workloads/how-to/`,
`docs/auth/reference/`, `docs/build/explanations/`. Top-level `docs/tutorials/`
holds cross-cutting tutorials.

### Deciding where content goes

- Teaching a newcomer a full end-to-end flow → **tutorial**.
- "How do I do X" for someone who already knows the platform → **how-to**.
- "Why does X work this way" / concepts / tradeoffs → **explanation**.
- Field lists, YAML schema, CLI flags, tables of values → **reference**.

Before writing, check existing pages in the target area to avoid duplication.
Link across categories instead of repeating (a how-to links to the reference
for full field lists; an explanation links to the how-to for the steps).

## Formatting conventions

### Frontmatter

```markdown
---
tags: [workloads, how-to]
---
```

### Code blocks

Use a language identifier. Add `title` and `hl_lines` when they help.

````markdown
```yaml title="app.yaml" hl_lines="5"
apiVersion: nais.io/v1alpha1
kind: Application
```
````

### Admonitions

```markdown
!!! info "Optional title"
    Content indented 4 spaces.

???+ note "Collapsible, open by default"
    Content here.
```

Types: `info`, `warning`, `danger`, `tip`, `note`, `example`.

### Tabs

```markdown
=== "Google Cloud"
    GCP-specific content

=== "On-prem"
    On-prem content
```

### External links

Add the icon suffix:

```markdown
[External resource :octicons-link-external-16:](https://example.com)
```

### Navigation

Each directory can have a `.pages` file controlling order and labels:

```yaml
title: Build and deploy
nav:
  - README.md
  - 🎯 How-To: how-to
  - 📚 Reference: reference
  - ...
```

## Template macros and tenant-specific content

Markdown is rendered by the SvelteKit site in `svdoc/`, which supports a
Jinja-like syntax with `<<` `>>` delimiters (**not** `{{` `}}`).

| Macro | Output |
| --- | --- |
| `<<tenant()>>` | Current tenant name (e.g. `nav`) |
| `<<tenant_url("console")>>` | Tenant-specific console URL |

Conditional content:

```markdown
{% if tenant() == "nav" %}
NAV-specific content here.
{% endif %}
```

Warn that a feature is missing in test-nais near the top of a page:

```markdown
<<not_in_test_nais("Name of feature")>>
```

Exclude or restrict a whole page via frontmatter:

```yaml
# exclude from these tenants
conditional: [not-test-nais, not-nav]

# include only for these tenants (the "tenant" keyword excludes all others)
conditional: [tenant, nav, ssb]
```

## Writing style

- Address the reader as "you".
- Active voice, present tense.
- Imperative for instructions: "Create the file", not "You should create the file".
- Short sentences, short paragraphs. Be direct — no filler, no preamble.
- Don't explain what the reader is about to read. Just present it.
- Nais platform terms need no explanation (Application, Job, workload, tenant).
- Prefer the Nais term over the Kubernetes term when there is a Nais equivalent.

### Plain language

Avoid AI writing patterns and corporate jargon: no "leverage", "seamless",
"robust", "delve into", "it's worth noting that", tricolons everywhere, em-dash
overuse, or empty authority frames. Say things plainly and concretely. The full
checklist lives in `.github/skills/plain-language/SKILL.md` — apply it as a
final pass on any prose you write or edit.

## Building and checking

Tasks are managed with [mise](https://mise.jdx.dev/) (`mise.toml`):

```bash
mise run setup    # install deps (Bun etc.)
mise run local    # serve docs locally
mise run check    # lint + svelte-check
mise run fmt      # format with prettier
```

Serve a tenant-specific build:

```bash
TENANT=nav NOT_TENANT=not-nav mise run local:dev
```

Build tenant outputs into `out/<tenant>/`:

```bash
mise run build nav nav test-nais
```

## Authoritative convention sources

These files hold the same conventions in more depth; keep this file in sync
with them if they change:

- `.github/agents/technical-writer.agent.md` — writing and formatting conventions
- `.github/copilot-instructions.md` — Diataxis tone per category
- `.github/skills/plain-language/SKILL.md` — full plain-language checklist

See the [Nais handbook doc-guidelines](https://handbook.nais.io/technical/doc-guidelines/)
for the broader contribution guide.
