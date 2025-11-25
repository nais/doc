import { readMarkdownFile, type Attributes } from "$lib/markdown";
import { error } from "@sveltejs/kit";
import { access } from "node:fs/promises";
import type { PageServerLoad } from "./$types";

async function fileExists(path: string): Promise<boolean> {
	try {
		await access(path);
		return true;
	} catch {
		return false;
	}
}

export const load: PageServerLoad = async ({ params }) => {
	const { path } = params;

	// Handle root path
	if (!path || path === "") {
		return await readMarkdownFile("../docs/README.md");
	}

	const basePath = `../docs/${path}`;

	// First, try the path as a direct .md file
	const mdFilePath = `${basePath}.md`;
	if (await fileExists(mdFilePath)) {
		return await readMarkdownFile(mdFilePath);
	}

	// Next, try as a directory with README.md
	const readmePath = `${basePath}/README.md`;
	if (await fileExists(readmePath)) {
		return await readMarkdownFile(readmePath);
	}

	// Check if it's a directory without README (category page)
	const dirPath = basePath;
	if (await fileExists(dirPath)) {
		// Return empty tokens - this is a category page without content
		return {
			tokens: [],
			attributes: {} as Attributes,
			isCategory: true,
		};
	}

	// Nothing found - throw 404
	error(404, {
		message: "Page not found",
	});
};
