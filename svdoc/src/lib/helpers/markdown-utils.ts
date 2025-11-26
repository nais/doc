/**
 * Shared markdown utilities used by both the markdown parser and search indexer.
 */

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
