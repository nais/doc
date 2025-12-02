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

/**
 * Strip markdown formatting from text, leaving plain text.
 * Useful for search indexing and excerpts.
 */
export function stripMarkdown(text: string): string {
	// TODO(thokra): Let's use something other than regex for this in the future
	return (
		text
			// Remove code blocks
			.replace(/```[\s\S]*?```/g, "")
			// Remove inline code
			.replace(/`[^`]+`/g, "")
			// Remove images
			.replace(/!\[[^\]]*\]\([^)]+\)/g, "")
			// Remove links but keep text
			.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
			// Remove HTML tags
			.replace(/<[^>]+>/g, "")
			// Remove admonition markers
			.replace(/^[!?]{3}\+?\s+[\w-]+(?:\s+"[^"]*")?\s*$/gm, "")
			// Remove content tab markers
			.replace(/^===\s+"[^"]+"\s*$/gm, "")
			// Remove emphasis
			.replace(/\*\*([^*]+)\*\*/g, "$1")
			.replace(/\*([^*]+)\*/g, "$1")
			.replace(/__([^_]+)__/g, "$1")
			.replace(/_([^_]+)_/g, "$1")
			// Remove emoji shortcodes
			.replace(/:[a-zA-Z0-9_+-]+:/g, "")
			// Remove heading markers
			.replace(/^#+\s+/gm, "")
			// Remove template variables
			.replace(/<<[^>]+>>/g, "")
			// Normalize whitespace
			.replace(/\s+/g, " ")
			.trim()
	);
}

export interface Heading {
	text: string;
	id: string;
	level: number;
}

/**
 * Extract headings from markdown content.
 * Returns an array of heading objects with text, id (slug), and level.
 */
export function extractHeadings(content: string): Heading[] {
	const headingRegex = /^(#{1,6})\s+(.+)$/gm;
	const headings: Heading[] = [];
	let match;

	while ((match = headingRegex.exec(content)) !== null) {
		const level = match[1].length;
		const rawText = match[2];
		const text = rawText
			.replace(/:[a-zA-Z0-9_+-]+:/g, "") // Remove emoji shortcodes
			.replace(/\*\*([^*]+)\*\*/g, "$1") // Remove bold
			.replace(/\*([^*]+)\*/g, "$1") // Remove italic
			.trim();

		if (text) {
			headings.push({
				text,
				id: slugify(text),
				level,
			});
		}
	}

	return headings;
}

/**
 * Extract plain text from a token's inline content.
 */
function extractTextFromToken(token: Token): string {
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
 * Extract headings from parsed markdown tokens.
 */
export function extractHeadingsFromTokens(tokens: Token[]): Heading[] {
	const headings: Heading[] = [];

	for (const token of tokens) {
		if (token.type === "heading") {
			const heading = token as { depth: number; text: string };
			const text = heading.text
				.replace(/:[a-zA-Z0-9_+-]+:/g, "") // Remove emoji shortcodes
				.replace(/\*\*([^*]+)\*\*/g, "$1") // Remove bold
				.replace(/\*([^*]+)\*/g, "$1") // Remove italic
				.trim();

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

/**
 * Extract the title from markdown content.
 * First tries frontmatter title attribute, then falls back to first H1.
 */
export function extractTitle(attributes: { title?: string }, content: string): string {
	if (attributes.title) {
		return attributes.title;
	}

	// Try first heading
	const headingMatch = content.match(/^#\s+(.+)$/m);
	if (headingMatch) {
		return headingMatch[1]
			.replace(/:[a-zA-Z0-9_+-]+:/g, "")
			.replace(/\*\*/g, "")
			.trim();
	}

	return "Untitled";
}
