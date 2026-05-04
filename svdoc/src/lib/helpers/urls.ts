/**
 * Centralized URL handling for the documentation site.
 *
 * Markdown source files live on disk as `*.md` (with `README.md` acting as the
 * directory index), while the rendered site exposes them as clean URLs that:
 *  - drop the `.md` extension
 *  - drop trailing `README` (a directory's README becomes the directory URL)
 *  - end with a trailing slash, matching SvelteKit's `trailingSlash: 'always'`
 *  - are prefixed with `BASE_PATH` when one is configured
 *
 * Two layers of input are converted here:
 *  1. **Markdown link targets** (e.g. `../foo/README.md#bar`) are resolved
 *     against the current page and turned into clean URLs via
 *     {@link transformMarkdownHref}.
 *  2. **Redirect map values** (e.g. `auth/explanations/README.md#login-proxy`)
 *     are turned into clean URLs via {@link mdPathToUrl}.
 *
 * Disk-path → URL-path conversion (which needs `node:path`) lives in
 * `content-store.ts`'s server-only context; everything in this file is safe
 * to import from browser code.
 *
 * Keep all `.md` / `README` / `BASE_PATH` / trailing-slash logic in this file
 * so the rules stay consistent across the renderer, content store, and
 * redirect handling.
 */

import { base } from "$app/paths";

/** Base path prefix for all internal URLs (set in `svelte.config.js`). */
const BASE_PATH = base;

const MD_EXT_RE = /\.md\/?$/i;
const README_SUFFIX_RE = /\/README$/i;
const HAS_FILE_EXT_RE = /\.[a-z0-9]+$/i;

/**
 * Strip the `.md` extension and any `/README` (directory index) segment
 * from a path. Anchors are not handled here — split them off before
 * calling.
 */
export function stripMarkdownSuffix(path: string): string {
	return path.replace(MD_EXT_RE, "").replace(README_SUFFIX_RE, "");
}

/** Collapse repeated slashes (`//` -> `/`). */
function collapseSlashes(path: string): string {
	return path.replace(/\/+/g, "/");
}

/** Append a trailing slash if the path looks like a page (no file extension). */
function appendTrailingSlash(path: string): string {
	if (!path || path.endsWith("/")) return path;
	if (HAS_FILE_EXT_RE.test(path)) return path;
	return path + "/";
}

/** Prepend `BASE_PATH` to a root-relative URL path, normalizing slashes. */
export function withBase(path: string): string {
	if (!BASE_PATH) return path;
	const normalized = path.startsWith("/") ? path : `/${path}`;
	return collapseSlashes(`${BASE_PATH}${normalized}`);
}

/**
 * Inverse of {@link withBase}: strip the `BASE_PATH` prefix from a URL path
 * if present. Used when re-deriving raw paths from `<a href>` values.
 */
export function stripBase(path: string): string {
	if (BASE_PATH && path.startsWith(BASE_PATH)) {
		return path.slice(BASE_PATH.length) || "/";
	}
	return path;
}

/**
 * Whether a markdown link target should be left untouched (external links,
 * mailto, plain anchors, etc.).
 */
function isExternalHref(href: string): boolean {
	return (
		href.startsWith("http://") ||
		href.startsWith("https://") ||
		href.startsWith("#") ||
		href.startsWith("mailto:") ||
		href.startsWith("tel:")
	);
}

/**
 * Resolve a relative href against the URL of the current page. Returns a
 * root-relative path (no `BASE_PATH`, no trailing slash, no anchor).
 */
function resolveRelative(path: string, basePath: string, isReadme: boolean): string {
	if (path.startsWith("/")) return path;
	if (path === "") return basePath || "/";

	// README files act as the directory index, so `basePath` already IS the
	// containing directory. For non-README files we need to strip the file
	// segment to get the directory.
	const baseDir = isReadme ? basePath : basePath.replace(/\/[^/]*$/, "") || "/";
	const segments = [...baseDir.split("/").filter(Boolean), ...path.split("/")];

	const resolved: string[] = [];
	for (const segment of segments) {
		if (segment === "..") {
			resolved.pop();
		} else if (segment !== ".") {
			resolved.push(segment);
		}
	}

	return "/" + resolved.join("/");
}

/**
 * Convert a markdown-style path (with optional `#anchor`) to a clean,
 * `BASE_PATH`-prefixed site URL with a trailing slash.
 *
 * Used for redirect map values where the path is already absolute relative to
 * the docs root (e.g. `auth/explanations/README.md#login-proxy`).
 */
export function mdPathToUrl(mdPath: string): string {
	const [pathPart, anchor] = mdPath.split("#");

	let urlPath = stripMarkdownSuffix(pathPart);
	if (!urlPath.startsWith("/")) {
		urlPath = "/" + urlPath;
	}
	urlPath = collapseSlashes(urlPath) || "/";
	urlPath = appendTrailingSlash(urlPath);
	urlPath = withBase(urlPath);

	return anchor ? `${urlPath}#${anchor}` : urlPath;
}

/**
 * Like {@link mdPathToUrl}, but returns the URL path *without* `BASE_PATH`,
 * trailing slash, or anchor. Use this when you need to look the URL up in the
 * content store, which keys documents by the canonical no-slash path.
 */
export function mdPathToContentKey(mdPath: string): string {
	const [pathPart] = mdPath.split("#");
	const stripped = stripMarkdownSuffix(pathPart);
	const withSlash = stripped.startsWith("/") ? stripped : "/" + stripped;
	return collapseSlashes(withSlash) || "/";
}

/**
 * Resolve a markdown link target against the current page's URL and produce a
 * clean site URL. Returns external/anchor-only/etc. hrefs unchanged.
 */
export function transformMarkdownHref(href: string, basePath: string, isReadme: boolean): string {
	if (isExternalHref(href)) return href;

	const [path, anchor] = href.split("#");
	const stripped = stripMarkdownSuffix(path);
	const resolved = resolveRelative(stripped, basePath, isReadme);
	const withSlash = appendTrailingSlash(resolved);
	const prefixed = withBase(withSlash);

	return anchor ? `${prefixed}#${anchor}` : prefixed;
}
