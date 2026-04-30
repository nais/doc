/**
 * Walk a marked AST and rewrite every link/image href so that:
 *  - relative `.md` links resolve against the current page
 *  - `README.md` collapses to its containing directory
 *  - the result is a clean, `BASE_PATH`-prefixed, trailing-slash URL
 *
 * Link transformation needs the *page's* URL (where the markdown lives) to
 * resolve `../foo.md` style references, so this pass runs from the content
 * store (which owns the page→URL mapping) rather than from the markdown
 * parser itself. Keep `readMarkdownFile` URL-agnostic; do all link rewriting
 * here.
 *
 * The walker is intentionally generic: it doesn't know which container token
 * types exist (admonitions, content_tabs, def_list, footnotes, code
 * annotations, html_with_markdown, etc.). It descends into every
 * object/array-valued property of every node it visits, and rewrites the
 * `href` of any object whose `type` is `"link"` or `"image"`. New container
 * types added to `markdown.ts` don't need a corresponding branch here —
 * which used to be a recurring source of "raw .md hrefs leaked into the
 * rendered HTML" bugs.
 *
 * We descend into all plain objects, not only marked tokens, because some
 * marked nodes (notably `Tokens.TableCell`) have no `type` field but still
 * contain `tokens` arrays we need to walk into.
 */

import type { Token, TokensList } from "marked";
import { transformMarkdownHref } from "./urls";

function isPlainObject(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null && !Array.isArray(value);
}

function walk(value: unknown, basePath: string, isReadme: boolean): unknown {
	if (Array.isArray(value)) {
		return value.map((item) => walk(item, basePath, isReadme));
	}

	if (isPlainObject(value)) {
		// Recursively walk every property. Strings and other primitives
		// short-circuit on the next call, so leaf fields like `href`, `text`,
		// `depth` flow through untouched.
		const next: Record<string, unknown> = {};
		for (const [key, child] of Object.entries(value)) {
			next[key] = walk(child, basePath, isReadme);
		}

		// Rewrite the link/image href on the cloned node.
		if (next.type === "link" || next.type === "image") {
			if (typeof next.href === "string") {
				next.href = transformMarkdownHref(next.href, basePath, isReadme);
			}
		}

		return next;
	}

	return value;
}

export function processLinks(
	tokens: Token[] | TokensList,
	basePath: string,
	isReadme: boolean,
): Token[] | TokensList {
	return tokens.map((token) => walk(token, basePath, isReadme) as Token);
}
