import { json } from "@sveltejs/kit";
import { readdir } from "node:fs/promises";
import { resolve } from "node:path";
import fm from "front-matter";
import type { RequestHandler } from "./$types";
import { IGNORED_DIRECTORIES } from "$lib/constants";
import {
	extractHeadings,
	extractTitle,
	stripMarkdown,
	type Heading,
} from "$lib/helpers/markdown-utils";

// Resolve the docs directory relative to project root
// process.cwd() in SvelteKit points to the project root (svdoc/)
const DOCS_DIR = resolve(process.cwd(), "../docs");

interface SearchDocument {
	id: string;
	title: string;
	path: string;
	headings: Heading[];
	content: string;
}

interface DocAttributes {
	title?: string;
	description?: string;
	tags?: string[];
	hide?: string[];
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
