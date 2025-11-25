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
