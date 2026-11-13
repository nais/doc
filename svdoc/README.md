# Documentation site

SvelteKit renders the Markdown sources in `../docs/`. The site runs on Node.js
and uses pnpm. Run `mise run setup` from the repository root to install the
pinned tools and dependencies.

## Development

From this directory:

```sh
pnpm run dev
pnpm run check
pnpm test
pnpm run lint
```

SvelteKit configuration, including the static adapter and prerender options, lives
in `vite.config.ts`. Internal library imports use `#lib/*`, defined in
`package.json`, with explicit file extensions.

## Build

Set the tenant when building:

```sh
TENANT=nav NOT_TENANT=not-nav pnpm run build
pnpm run preview
```

To build multiple tenants, use `mise run build nav ssb` from the repository root.

Set `BASE_PATH=/docs` to build for a URL prefix. Omit the trailing slash.

## UI

Components live in `src/lib/shadcn/ui/`, following console-frontend's local
shadcn UI pattern. Bits UI handles dialogs, and Lucide supplies icons.
Theme tokens and compatibility aliases for existing `--ax-*` variables live in
`src/css/shadcn.css`.

Mermaid loads only on pages with diagrams. Its parser and layout-engine chunks
can still exceed Vite's size warning threshold; ordinary pages do not load them.

### Shared UI pilot

This branch tests the documentation search with the published `@nais/ui@0.1.0`
package from `nais/console-frontend`. The local Modal adapter
preserves doc's props, accessible name and description, dimensions and scrolling.
It unmounts the search header and results when closed, even though the package
keeps its dialog shell mounted. Bits UI handles initial focus and focus return;
the search no longer uses a focus timeout.

The root Theme, header buttons, error-page buttons and copy controls stay local.
The browser fixture tests package Button and nested Theme without changing those
production components. It is not included in the documentation build.

From the repository root:

```sh
mise run setup
mise run check
mise exec -- pnpm --dir svdoc run test:ui-pilot
mise run build nav ssb test-nais ldir atil ci-nais dev-nais miljodir novari
```

`svdoc/.npmrc` maps the `@nais` scope to Nais's public Google Artifact Registry.
No token or Google authentication is required. The dependency is pinned to
`0.1.0`, and setup installs the frozen lockfile. `@nais/ui` is exempt from the
release-age delay in `pnpm-workspace.yaml`; the delay still applies to other
packages unless separately listed.

If Chromium is missing, install it with
`mise exec -- pnpm --dir svdoc exec playwright install chromium`.

Browser tests run with zero retries. They cover light/dark themes, 375/800/801/1280px
widths, portal placement, mounting, keyboard search, focus trapping and return,
Escape, close button, backdrop, host styling and hydration diagnostics.
`DOC_PILOT_URL` can point the same tests at a running static build instead of
starting the dev server. The separate fixture server still starts automatically.

Import package tokens in the components layer **before** local `shadcn.css`,
then import package `theme.css` as documented by console. Doc keeps its fonts,
reset, focus and link rules, and `--ax-*` aliases. The local palette must win:
the package has a different dark `--info-foreground`.

Before permanent adoption:

- Resolve the existing peer warning from `runed@0.35.1`, used by both doc's
  Bits UI and the package's `bits-ui@2.20.2`. Its optional SvelteKit peer declares
  `^2.21.0`, but doc uses `3.2.0`. The dialog uses the framework-independent
  `runed` entry point, not `runed/kit`. Do not hide the warning with an override.
- Agree on publishing ownership, immutable versions and semantic-versioning/release notes.
- Define supported Svelte, SvelteKit and Bits UI versions. The package pins
  older Bits UI and Lucide versions than doc, so both versions are installed.
- Consider public modal styling hooks for layer/header/body, a separate
  accessible title/description API, mounting control and autofocus callbacks.
  The adapter currently relies on package CSS classes for visual compatibility.

No package changes are included in this pilot.
