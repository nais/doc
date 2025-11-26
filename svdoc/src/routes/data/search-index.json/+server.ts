import { json } from "@sveltejs/kit";
import { readdir } from "node:fs/promises";
import { resolve } from "node:path";
import fm from "front-matter";
import type { RequestHandler } from "./$types";

// Resolve the docs directory relative to project root
// process.cwd() in SvelteKit points to the project root (svdoc/)
const DOCS_DIR = resolve(process.cwd(), "../docs");

interface SearchDocument {
	id: string;
	title: string;
	path: string;
	headings: { text: string; id: string; level: number }[];
	content: string;
}

interface DocAttributes {
	title?: string;
	description?: string;
	tags?: string[];
	hide?: string[];
}

// Directories to ignore
const IGNORED_DIRECTORIES = new Set(["assets", "css", "material_theme_stylesheet_overrides"]);

/**
 * Strip markdown formatting from text
 */
function stripMarkdown(text: string): string {
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
			// Remove admonitions markers
			.replace(/^[!?]{3}\+?\s+\w+(?:\s+"[^"]*")?\s*$/gm, "")
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
			// Normalize whitespace
			.replace(/\s+/g, " ")
			.trim()
	);
}

/**
 * Generate a slug from heading text for anchor IDs
 */
function slugify(text: string): string {
	return text
		.toLowerCase()
		.replace(/:[a-zA-Z0-9_+-]+:/g, "") // Remove emoji shortcodes
		.replace(/[^\w\s-]/g, "") // Remove special chars
		.replace(/\s+/g, "-") // Replace spaces with dashes
		.replace(/-+/g, "-") // Collapse multiple dashes
		.trim();
}

/**
 * Extract headings from markdown content
 */
function extractHeadings(content: string): { text: string; id: string; level: number }[] {
	const headingRegex = /^(#{1,6})\s+(.+)$/gm;
	const headings: { text: string; id: string; level: number }[] = [];
	let match;

	while ((match = headingRegex.exec(content)) !== null) {
		const level = match[1].length;
		const text = match[2]
			.replace(/:[a-zA-Z0-9_+-]+:/g, "") // Remove emoji
			.replace(/\*\*([^*]+)\*\*/g, "$1") // Remove bold
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
 * Get title from markdown content
 */
function extractTitle(attributes: DocAttributes, content: string): string {
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

/**
 * Convert file path to URL path
 */
function filePathToUrl(filePath: string): string {
	// Remove the docs directory prefix and convert to URL path
	const relativePath = filePath.startsWith(DOCS_DIR)
		? filePath.slice(DOCS_DIR.length)
		: filePath.replace(/^\.\.\/docs\/?/, "/");

	return (
		relativePath
			.replace(/^\//, "/")
			.replace(/\/README\.md$/i, "")
			.replace(/\.md$/, "") || "/"
	);
}

/**
 * Recursively find all markdown files in a directory
 */
async function findMarkdownFiles(dirPath: string): Promise<string[]> {
	const files: string[] = [];

	try {
		const entries = await readdir(dirPath, { withFileTypes: true });

		for (const entry of entries) {
			// Skip hidden files and ignored directories
			if (entry.name.startsWith(".")) continue;
			if (IGNORED_DIRECTORIES.has(entry.name.toLowerCase())) continue;

			const fullPath = `${dirPath}/${entry.name}`;

			if (entry.isDirectory()) {
				const subFiles = await findMarkdownFiles(fullPath);
				files.push(...subFiles);
			} else if (entry.name.endsWith(".md")) {
				files.push(fullPath);
			}
		}
	} catch {
		// Directory doesn't exist or can't be read
	}

	return files;
}

/**
 * Process a single markdown file into a search document
 */
async function processMarkdownFile(filePath: string): Promise<SearchDocument | null> {
	try {
		const source = await Bun.file(filePath).text();
		const { attributes, body } = fm<DocAttributes>(source);

		// Skip if hidden
		if (attributes.hide?.includes("navigation")) {
			return null;
		}

		const title = extractTitle(attributes, body);
		const headings = extractHeadings(body);
		const content = stripMarkdown(body);
		const path = filePathToUrl(filePath);

		return {
			id: filePath,
			title,
			path,
			headings,
			content: content.slice(0, 10000), // Limit content size
		};
	} catch {
		return null;
	}
}

/**
 * Build the complete search index
 */
async function buildSearchIndex(): Promise<SearchDocument[]> {
	const files = await findMarkdownFiles(DOCS_DIR);
	const documents: SearchDocument[] = [];

	for (const file of files) {
		const doc = await processMarkdownFile(file);
		if (doc) {
			documents.push(doc);
		}
	}

	return documents;
}

export const GET: RequestHandler = async () => {
	const documents = await buildSearchIndex();

	return json(documents, {
		headers: {
			"Cache-Control": "public, max-age=3600",
		},
	});
};

// Prerender this endpoint during build
export const prerender = true;
