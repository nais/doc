import { resolve } from "node:path";
import { readdir } from "node:fs/promises";
import fm from "front-matter";
import { IGNORED_DIRECTORIES } from "$lib/constants";
import type { PageServerLoad } from "./$types";

const DOCS_DIR = resolve(process.cwd(), "../docs");

interface DocAttributes {
	title?: string;
	description?: string;
	tags?: string[];
	hide?: string[];
}

export interface TagInfo {
	name: string;
	count: number;
	slug: string;
}

/**
 * Convert a tag name to a URL-safe slug
 */
function tagToSlug(tag: string): string {
	return tag
		.toLowerCase()
		.replace(/\s+/g, "-")
		.replace(/[^a-z0-9-]/g, "");
}

/**
 * Recursively find all markdown files in a directory
 */
async function findMarkdownFiles(dirPath: string): Promise<string[]> {
	const files: string[] = [];

	try {
		const entries = await readdir(dirPath, { withFileTypes: true });

		for (const entry of entries) {
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
 * Build a map of all tags with their counts
 */
async function getAllTags(): Promise<TagInfo[]> {
	const files = await findMarkdownFiles(DOCS_DIR);
	const tagCounts = new Map<string, number>();

	for (const file of files) {
		try {
			const source = await Bun.file(file).text();
			const { attributes } = fm<DocAttributes>(source);

			if (attributes.tags && Array.isArray(attributes.tags)) {
				for (const tag of attributes.tags) {
					const count = tagCounts.get(tag) || 0;
					tagCounts.set(tag, count + 1);
				}
			}
		} catch {
			// Skip files that can't be read
		}
	}

	// Convert to array and sort alphabetically
	const tags: TagInfo[] = Array.from(tagCounts.entries())
		.map(([name, count]) => ({
			name,
			count,
			slug: tagToSlug(name),
		}))
		.sort((a, b) => a.name.localeCompare(b.name));

	return tags;
}

export const prerender = true;

export const load: PageServerLoad = async () => {
	const tags = await getAllTags();

	return {
		tags,
	};
};
