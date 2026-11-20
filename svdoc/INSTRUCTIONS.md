# Svelte Markdown Renderer Instructions

## Documentation Source

The markdown documentation files are located in the `docs/` directory at the repository root (relative path from svdoc: `../docs/`).

## Architecture

This project implements a custom Svelte-based markdown renderer using the `marked` library. Instead of rendering markdown to HTML strings, we parse it into tokens and render them as Svelte components.

### Token Flow

1. **Parsing**: `src/lib/markdown.ts` uses `Marked` to parse markdown into a token stream
2. **Processing**: Custom extensions and post-processing handle emojis, HTML blocks with `markdown` attribute, and footnotes
3. **Rendering**: `Renderer.svelte` maps token types to Svelte components recursively

## Custom Marked Extensions

### Emoji Extension

Converts `:emoji_name:` shortcodes to native emoji characters (e.g., `:wave:` → 👋). Uses `emoji-name-map` for the conversion. Implemented as an inline tokenizer extension.

### Footnote Extension

Custom implementation (not using `marked-footnote`) with two parts:

- `footnoteRef` (inline): Parses `[^1]` references
- `footnote` (block): Parses `[^1]: content` definitions

The `processFootnotes()` function collects all footnote definitions and moves them to the end wrapped in a `footnotes` token.

### HTML with Markdown Attribute

Material for MkDocs uses `<div class="grid cards" markdown>` to indicate the div's content should be parsed as markdown. The `processHtmlMarkdownBlocks()` function:

1. Detects opening tags with `markdown` attribute
2. Finds the matching closing tag
3. Combines into a single `html_with_markdown` token with `openTag`, `closeTag`, and `innerTokens`

The `HtmlWithMarkdown.svelte` renderer uses `<svelte:element>` to render the correct tag with extracted class/id attributes.

## Renderer Components

Each markdown token type maps to a Svelte component in `src/lib/renderers/`. The main `Renderer.svelte` component maintains a map of token types to components and recursively renders nested tokens.

### Key Implementation Notes

- **Hydration**: Avoid separate `{@html}` calls for opening/closing tags - use actual elements or `<svelte:element>` to prevent hydration mismatches
- **Invalid Attributes**: The `markdown` attribute must be stripped from HTML as browsers remove it client-side, causing hydration errors
- **List Items**: Use native `<ul>`/`<ol>`/`<li>` elements for markdown lists
- **Each Blocks**: Always use keyed `{#each}` blocks (e.g., `{#each items as item, i (i)}`)

## Design System Integration

Uses local components in `src/lib/shadcn/ui/`, following console-frontend:

- `Heading` for headings (with dynamic `as` and `size` props)
- `BodyLong` for paragraphs
- `CopyButton` in code blocks
- `Modal` backed by Bits UI for search
- Lucide icons from `@lucide/svelte`

Lists, tables, blockquotes and collapsible admonitions use native HTML.
Theme tokens live in `src/css/shadcn.css`, including aliases for existing
`--ax-*` variables. Do not add a dependency on `@nais/ds-svelte-community`.

## MkDocs Material Compatibility

This renderer supports several Material for MkDocs features:

### Admonitions

Supports `!!!`, `???`, and `???+` syntax for notes, warnings, etc:

- `!!! note "Title"` - Regular admonition
- `??? note "Title"` - Collapsible (closed)
- `???+ note "Title"` - Collapsible (open by default)

### Content Tabs

Supports `=== "Tab Title"` syntax with indented content. Tabs get URL-stable slugs from their labels, so `?tab=<slug>` opens matching tabs directly; clicking a tab updates the URL without a page reload. Link to a tab with a normal Markdown link, for example `[CLI](create.md?tab=cli)`.

### Code Annotations

Supports inline code annotations using comment syntax:

- `# (1)` or `// (1)` - Annotation marker (hover to reveal)
- `# Replace (1)` - Text before marker is preserved in output
- `#(1)!` - The `!` suffix strips the entire comment

Annotations link to numbered lists following the code block.

## Syntax Highlighting

Uses Shiki for server-side syntax highlighting with dual theme support (light/dark).

### Code Fence Options

- Language: ` ```yaml `
- Line highlighting: ` ```yaml hl_lines="4-5 8" `
- Title: ` ```yaml title="config.yaml" `

Highlighting is processed at build time via `src/lib/helpers/shiki.ts`.

## Navigation System

Navigation is built from the `../docs` directory structure in `src/lib/navigation.ts`.

### .pages Files

Supports MkDocs-style `.pages` files for navigation configuration:

- `nav:` - Ordered list of items
- `hide: true` - Exclude directory from navigation
- `...` - Include all unlisted items at that position
- Explicit titles: `{ "Display Name": "path" }`

### Directory Handling

- Directories use their name as the nav title (not README heading)
- `hasContent` is true only if directory contains README.md
- Items without content render as text, not links

## Editable Variables

The renderer supports editable placeholder variables in both inline code and code blocks.

### Syntax

- `<VARIABLE_NAME>` - Editable variable (uppercase letters, underscores, hyphens)
- `<VARIABLE_NAME:readonly>` - Read-only variable (displays but can't be edited)

### How It Works

1. **Inline code** (`Codespan.svelte`): The `textAndVariables()` function parses the code span for variable patterns and renders `Variable` components inline.

2. **Code blocks** (`Code.svelte`):
   - Uses Svelte 5's experimental async mode to await Shiki highlighting directly in the component
   - Variables are extracted before highlighting and replaced with unique placeholders
   - A Shiki transformer wraps these placeholders in `<span class="svdoc-variable-marker">` elements with data attributes
   - After mount, `Variable` components are mounted into these marker spans using Svelte 5's `mount()` API
   - The page context is passed as a prop since `mount()` doesn't inherit Svelte context

### Implementation

- `src/lib/components/Variable.svelte` - The editable variable component with click-to-edit UI (accepts optional `ctx` prop for mount scenarios)
- `src/lib/state/page_context.svelte.ts` - Reactive context using `SvelteMap` to share variable values across the page
- `src/lib/helpers/shiki.ts` - `extractVariables()` function and Shiki transformer for wrapping placeholders in marker spans

### Example

```yaml
kubectl get pods -n <NAMESPACE>
```

Users can click on `<NAMESPACE>` to enter their actual namespace value, which persists across all instances on the page.

## Svelte MCP Server

This project uses the Svelte MCP (Model Context Protocol) server for AI-assisted development. The MCP server provides comprehensive Svelte 5 and SvelteKit documentation and code analysis.

### Available Tools

1. **list-sections** - Discover all available documentation sections. Use this FIRST when asked about Svelte topics.

2. **get-documentation** - Retrieves full documentation for specific sections. After list-sections, analyze the `use_cases` field and fetch ALL relevant sections at once.

3. **svelte-autofixer** - Analyzes Svelte code and returns issues/suggestions. MUST be used when writing Svelte code before sending to the user.

4. **playground-link** - Generates a Svelte Playground link. Only use after user confirms they want one, and NEVER if code was written to project files.

### Key Svelte 5 Patterns

- **Use `$effect` instead of `onMount`** for DOM manipulation after render. Effects re-run when their dependencies change and include cleanup via return function.
- **`onMount` only runs once** and doesn't track reactive dependencies - use `$effect` when you need reactivity.
- **`$effect` runs after DOM updates** in a microtask, making it ideal for mounting imperative components into rendered HTML.
- **Track dependencies explicitly** - `$effect` only tracks values read synchronously in its body. Values read after `await` or in `setTimeout` are not tracked.

### Example: Mounting Components into Rendered HTML

```svelte
<script>
	import { mount, unmount } from "svelte";
	import MyComponent from "./MyComponent.svelte";

	let container = $state();

	// $effect tracks `container` and runs after DOM updates
	$effect(() => {
		if (!container) return;

		const markers = container.querySelectorAll(".marker");
		const mounted = [];

		markers.forEach((marker) => {
			const instance = mount(MyComponent, {
				target: marker,
				props: {/* props here */},
			});
			mounted.push(instance);
		});

		// Cleanup runs before re-run and on destroy
		return () => {
			mounted.forEach((instance) => unmount(instance));
		};
	});
</script>

<div bind:this={container}>
	{@html someHtmlWithMarkers}
</div>
```

## Template Processing

The `src/lib/helpers/templates.ts` module processes Jinja-like templates:

### Variables

- `<<tenant()>>` - Tenant name, defaulting to `nav` when `TENANT` is unset
- `<<tenant_url("console", "path")>>` - Tenant-specific service URL with an optional path

### Loops

`{% for env in environments() %}...{% endfor %}` iterates the current tenant's
environments (alphabetical, `prod` last). Loop fields are typed records from
`src/lib/helpers/tenant-docs.ts`: `env.name`, `env.domains` (each with `name`
and `external`), `env.externalIps`, `env.defaultLogDestination`. Use
`{% if not has_environments() %}` for tenants without documented environments.

Loops nest (`for` inside `for`), conditionals work inside loop bodies with
record fields (`{% if d.external %}`), dot paths work in variables
(`<<env.name>>`), and macros accept record fields as arguments
(`<<external_ips(env.name)>>`). Prose belongs in the Markdown loop bodies —
`environments()` returns structure only.

Domain lists are classified before rendering: product domains (not under the
tenant's own domain or cloud.nais.io) are dropped, legacy `-gcp.` aliases are
hidden, `authenticated.*` is hidden when a dedicated `ansatt.*` domain exists,
and the `external.*.cloud.nais.io` fallback is hidden when the environment has
a dedicated external domain. The full unfiltered list stays in the bucket
data; this is presentation only.

### Tenant environment data

Tenant values come from the public `nais-tenant-data` GCS bucket, written by
nais-terraform-modules on every apply:

- `docs/<tenant>/tenant.json` — tenant name, domain, console URL, doc publish
  buckets, management project id, workload identity provider
- `docs/<tenant>/<env>.json` — external IPs, Kafka pool, ingress domains, log
  destinations, and (when it cannot be derived) the telemetry collector URL

`src/lib/helpers/tenant-data.ts` fetches and caches these at build time.
Missing data yields placeholders — the build never fails on absent tenant data.

`src/lib/helpers/tenant-docs.ts` and `src/lib/helpers/templates.ts` render this
data through template macros:

- `<<external_ips("prod")>>` - Bullet list of the environment's outbound IPs
- `<<kafka_pools()>>` - Kafka pool table, or a "no pools" note
- `<<log_destinations()>>` - Available log destinations
- `<<default_log_destination()>>` - Default log destination (prod env's default, else first env's)
- `<<example_domain("external")>>` - Representative ingress domain for examples
- `<<management_project_id()>>` / `<<identity_provider()>>` - Deploy values
- `<<publishes_deploy_data()>>` - For `{% if %}` conditions in deploy examples
- `<<telemetry_collectors()>>` - Collector endpoint table
- `<<telemetry_csp_sources()>>` - Unique collector origins, without paths, for CSP `connect-src`
- `<<telemetry_collector_url()>>` - Example collector URL
- `<<telemetry_environment()>>` - Environment used by that example

Collector URLs are resolved by Terraform before publishing: an explicit
override (`telemetry_collector_domain`, used by nav) wins, otherwise the URL
is derived from the environment's `external.*.cloud.nais.io` ingress domain
(falling back to the default external domain). Environments without a
collector URL, such as on-prem (which is not published at all), are omitted
from collector tables and CSP sources. The tenant object also carries
`otlpInternetEndpoint`, the internet-facing OTLP collector for workloads
outside the tenant clusters. Examples prefer the `prod` environment,
otherwise the first. `tenant_url()` rejects collector URL construction so
callers cannot bypass the shared data.

Update the tenant data rather than duplicating values in Markdown. Do not assume
every tenant uses `dev`/`prod`. Regression tests live in
`src/lib/helpers/tenant-docs.test.ts` and `src/lib/helpers/templates.test.ts`.

### Includes

- `{% include 'path/to/file.md' %}` - Paths relative to docs root

### Conditionals

- `{% if tenant() == "nav" %}...{% endif %}`
