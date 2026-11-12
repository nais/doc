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
