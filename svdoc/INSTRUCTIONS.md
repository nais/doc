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
- **List Items**: Use native `<ul>`/`<ol>`/`<li>` elements for markdown lists, as ds-svelte-community's List/ListItem have different semantics
- **Each Blocks**: Always use keyed `{#each}` blocks (e.g., `{#each items as item, i (i)}`)

## Design System Integration

Uses `@nais/ds-svelte-community` components where appropriate:

- `Heading` for headings (with dynamic `as` and `size` props)
- `BodyLong` for paragraphs
- `Alert` for blockquotes
- `List` and `ListItem` for lists
- `Table`, `Thead`, `Tbody`, `Tr`, `Th`, `Td` for tables
- `CopyButton` in code blocks

Regular `<a>` elements are used for links.

## MkDocs Material Compatibility

This renderer supports several Material for MkDocs features:

### Admonitions

Supports `!!!`, `???`, and `???+` syntax for notes, warnings, etc:
- `!!! note "Title"` - Regular admonition
- `??? note "Title"` - Collapsible (closed)
- `???+ note "Title"` - Collapsible (open by default)

### Content Tabs

Supports `=== "Tab Title"` syntax with indented content.

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

## Template Processing

The `src/lib/helpers/templates.ts` module processes Jinja-like templates:

### Variables

- `<<tenant()>>` - Tenant name
- `<<tenant_url("path")>>` - Tenant-specific URL

### Includes

- `{% include 'path/to/file.md' %}` - Paths relative to docs root

### Conditionals

- `{% if tenant() == "nav" %}...{% endif %}`
