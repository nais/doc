import { resolve } from "node:path";
import { readdir } from "node:fs/promises";
import fm from "front-matter";
import { IGNORED_DIRECTORIES } from "$lib/constants";
import { extractTitle } from "$lib/helpers/markdown-utils";
import { error } from "@sveltejs/kit";
import type { PageServerLoad, EntryGenerator } from "./$types";

const DOCS_DIR = resolve(process.cwd(), "../docs");

interface DocAttributes {
	title?: string;
	description?: string;
	tags?: string[];
	hide?: string[];
}

export interface PageInfo {
	title: string;
	path: string;
	description?: string;
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
 * Convert file path to URL path
 */
function filePathToUrl(filePath: string): string {
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
 * Build a map of all tags with their pages
 */
async function getTagsWithPages(): Promise<Map<string, { name: string; pages: PageInfo[] }>> {
	const files = await findMarkdownFiles(DOCS_DIR);
	const tagsMap = new Map<string, { name: string; pages: PageInfo[] }>();

	for (const file of files) {
		try {
			const source = await Bun.file(file).text();
			const { attributes, body } = fm<DocAttributes>(source);

			if (attributes.tags && Array.isArray(attributes.tags)) {
				const title = extractTitle(attributes, body);
				const path = filePathToUrl(file);

				for (const tag of attributes.tags) {
					const slug = tagToSlug(tag);
					const existing = tagsMap.get(slug);

					const pageInfo: PageInfo = {
						title,
						path,
						description: attributes.description,
					};

					if (existing) {
						existing.pages.push(pageInfo);
					} else {
						tagsMap.set(slug, {
							name: tag,
							pages: [pageInfo],
						});
					}
				}
			}
		} catch {
			// Skip files that can't be read
		}
	}

	// Sort pages alphabetically within each tag
	for (const tag of tagsMap.values()) {
		tag.pages.sort((a, b) => a.title.localeCompare(b.title));
	}

	return tagsMap;
}

export const entries: EntryGenerator = async () => {
	const tagsMap = await getTagsWithPages();
	return Array.from(tagsMap.keys()).map((tag) => ({ tag }));
};

export const prerender = true;

export const load: PageServerLoad = async ({ params }) => {
	const { tag } = params;
	const tagsMap = await getTagsWithPages();

	const tagData = tagsMap.get(tag);

	if (!tagData) {
		error(404, {
			message: `Tag "${tag}" not found`,
		});
	}

	return {
		tag: tagData.name,
		slug: tag,
		pages: tagData.pages,
	};
};
