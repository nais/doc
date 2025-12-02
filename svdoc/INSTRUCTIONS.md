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
  import { mount, unmount } from 'svelte';
  import MyComponent from './MyComponent.svelte';
  
  let container = $state();
  
  // $effect tracks `container` and runs after DOM updates
  $effect(() => {
    if (!container) return;
    
    const markers = container.querySelectorAll('.marker');
    const mounted = [];
    
    markers.forEach((marker) => {
      const instance = mount(MyComponent, {
        target: marker,
        props: { /* props here */ }
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

- `<<tenant()>>` - Tenant name
- `<<tenant_url("path")>>` - Tenant-specific URL

### Includes

- `{% include 'path/to/file.md' %}` - Paths relative to docs root

### Conditionals

- `{% if tenant() == "nav" %}...{% endif %}`
