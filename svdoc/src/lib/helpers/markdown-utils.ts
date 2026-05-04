/**
 * Shared markdown utilities used by both the markdown parser and search indexer.
 */

import type { Token } from "marked";

/**
 * Generate a URL-friendly slug from text.
 * Used for heading anchor IDs.
 */
export function slugify(text: string): string {
	return text
		.toLowerCase()
		.replace(/:[a-zA-Z0-9_+-]+:/g, "") // Remove emoji shortcodes
		.replace(/[^\w\s-]/g, "") // Remove special chars
		.replace(/\s+/g, "-") // Replace spaces with dashes
		.replace(/-+/g, "-") // Collapse multiple dashes
		.trim();
}

export interface Heading {
	text: string;
	id: string;
	level: number;
}

/**
 * Extract plain text from a token's inline content.
 */
function extractTextFromToken(token: Token): string {
	// Lists have `items` (list_item tokens), each with their own `tokens`
	if (token.type === "list" && "items" in token && Array.isArray(token.items)) {
		return token.items.map(extractTextFromToken).join(" ");
	}

	// Tables have `header` (cells) and `rows` (rows of cells); each cell has `tokens`
	if (token.type === "table") {
		const tableToken = token as unknown as {
			header?: Array<{ tokens?: Token[]; text?: string }>;
			rows?: Array<Array<{ tokens?: Token[]; text?: string }>>;
		};
		const parts: string[] = [];
		for (const cell of tableToken.header ?? []) {
			if (cell.tokens) {
				parts.push(cell.tokens.map(extractTextFromToken).join(""));
			} else if (cell.text) {
				parts.push(cell.text);
			}
		}
		for (const row of tableToken.rows ?? []) {
			for (const cell of row) {
				if (cell.tokens) {
					parts.push(cell.tokens.map(extractTextFromToken).join(""));
				} else if (cell.text) {
					parts.push(cell.text);
				}
			}
		}
		return parts.join(" ");
	}

	// Content tabs have `tabs`, each tab has `tokens`
	if (token.type === "content_tabs" && "tabs" in token && Array.isArray(token.tabs)) {
		return (token.tabs as Token[]).map(extractTextFromToken).join(" ");
	}

	// Definition lists and footnotes have `items` arrays
	if (
		(token.type === "def_list" || token.type === "footnotes") &&
		"items" in token &&
		Array.isArray(token.items)
	) {
		return (token.items as Token[]).map(extractTextFromToken).join(" ");
	}

	// Definition list items: term + definitions
	if (token.type === "def_list_item") {
		const t = token as unknown as {
			term?: string;
			termTokens?: Token[];
			definitions?: Array<{ tokens?: Token[] }>;
		};
		const parts: string[] = [];
		if (t.termTokens?.length) {
			parts.push(t.termTokens.map(extractTextFromToken).join(""));
		} else if (t.term) {
			parts.push(t.term);
		}
		for (const def of t.definitions ?? []) {
			if (def.tokens) {
				parts.push(def.tokens.map(extractTextFromToken).join(""));
			}
		}
		return parts.join(" ");
	}

	// HTML blocks with embedded markdown
	if (
		token.type === "html_with_markdown" &&
		"innerTokens" in token &&
		Array.isArray(token.innerTokens)
	) {
		return (token.innerTokens as Token[]).map(extractTextFromToken).join(" ");
	}

	if ("text" in token && typeof token.text === "string") {
		// For tokens with nested tokens, recurse into them
		if ("tokens" in token && Array.isArray(token.tokens)) {
			return token.tokens.map(extractTextFromToken).join("");
		}
		return token.text;
	}
	if ("tokens" in token && Array.isArray(token.tokens)) {
		return token.tokens.map(extractTextFromToken).join("");
	}
	return "";
}

/**
 * Remove emoji shortcodes from text (e.g., :seedling:, :rocket:)
 */
function stripEmojiShortcodes(text: string): string {
	return text.replace(/:[a-zA-Z0-9_+-]+:/g, "").trim();
}

/**
 * Extract text from tokens for generating heading IDs.
 * Strips emoji shortcodes and extracts only actual text content.
 * This matches how mkdocs generates heading IDs.
 */
export function extractTextForId(tokens: Token[]): string {
	const parts: string[] = [];

	for (const token of tokens) {
		if (token.type === "text") {
			// Strip emoji shortcodes from text content
			const text = stripEmojiShortcodes((token as { text: string }).text);
			if (text) {
				parts.push(text);
			}
		} else if ("tokens" in token && Array.isArray(token.tokens)) {
			// Recurse into nested tokens (e.g., strong, em)
			const nestedText = extractTextForId(token.tokens);
			if (nestedText) {
				parts.push(nestedText);
			}
		}
	}

	return parts.join(" ").replace(/\s+/g, " ").trim();
}

/**
 * Extract headings from parsed markdown tokens.
 */
export function extractHeadingsFromTokens(tokens: Token[]): Heading[] {
	const headings: Heading[] = [];

	for (const token of tokens) {
		if (token.type === "heading") {
			const heading = token as { depth: number; text: string; tokens?: Token[] };
			// Extract text from nested tokens, skipping emoji shortcodes
			const text = heading.tokens ? extractTextForId(heading.tokens) : heading.text;

			if (text) {
				headings.push({
					text,
					id: slugify(text),
					level: heading.depth,
				});
			}
		}
	}

	return headings;
}

/**
 * Strip markdown tokens to plain text for search indexing.
 */
export function stripMarkdownTokens(tokens: Token[]): string {
	const textParts: string[] = [];

	for (const token of tokens) {
		// Skip code blocks
		if (token.type === "code") {
			continue;
		}

		const text = extractTextFromToken(token);
		if (text) {
			textParts.push(text);
		}
	}

	return textParts.join(" ").replace(/\s+/g, " ").trim();
}

/**
 * Extract a summary from parsed markdown tokens.
 * Takes the first 1-2 paragraphs of content, skipping headings, code blocks, etc.
 */
export function extractSummaryFromTokens(
	tokens: Token[],
	maxLength: number = 200,
): string | undefined {
	const paragraphs: string[] = [];

	for (const token of tokens) {
		// Only consider paragraph tokens
		if (token.type === "paragraph") {
			const text = extractTextFromToken(token).trim();
			// Skip empty or very short paragraphs
			if (text.length >= 10) {
				paragraphs.push(text);
				// Stop after collecting 2 paragraphs
				if (paragraphs.length >= 2) {
					break;
				}
			}
		}
	}

	if (paragraphs.length === 0) {
		return undefined;
	}

	// Take first paragraph, or combine first two if the first is short
	let summary = paragraphs[0];
	if (summary.length < 100 && paragraphs.length > 1) {
		summary = paragraphs[0] + " " + paragraphs[1];
	}

	// Truncate at word boundary if needed
	if (summary.length <= maxLength) {
		return summary;
	}

	const truncated = summary.slice(0, maxLength);
	const lastSpace = truncated.lastIndexOf(" ");

	if (lastSpace > maxLength * 0.5) {
		return truncated.slice(0, lastSpace) + "…";
	}

	return truncated + "…";
}
