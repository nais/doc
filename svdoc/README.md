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

## Build

Set the tenant when building:

```sh
TENANT=nav NOT_TENANT=not-nav pnpm run build
pnpm run preview
```

To build multiple tenants, use `mise run build nav ssb` from the repository root.

## UI

Components live in `src/lib/shadcn/ui/`, following console-frontend's local
shadcn UI pattern. Bits UI handles dialogs, and Lucide supplies icons.
Theme tokens and compatibility aliases for existing `--ax-*` variables live in
`src/css/shadcn.css`.
