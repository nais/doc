import { readMarkdownFile, type Attributes } from "$lib/markdown";
import { getAllPaths } from "$lib/navigation";
import { getAllRedirects, getRedirectTarget } from "$lib/redirects";
import { error, redirect } from "@sveltejs/kit";
import { access } from "node:fs/promises";
import type { EntryGenerator, PageServerLoad } from "./$types";

async function fileExists(path: string): Promise<boolean> {
	try {
		await access(path);
		return true;
	} catch {
		return false;
	}
}

/**
 * Generate all entry points for static prerendering
 */
export const entries: EntryGenerator = async () => {
	const paths = await getAllPaths();
	const redirects = getAllRedirects();

	// Combine regular paths and redirect source paths
	const allPaths = [
		...paths.map((path) => ({ path })),
		...redirects.map((r) => ({ path: r.from.replace(/^\//, "") })),
	];

	return allPaths;
};

export const prerender = true;

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

	// Check if there's a redirect for this path
	const redirectTarget = getRedirectTarget(path);
	if (redirectTarget) {
		redirect(301, redirectTarget);
	}

	// Nothing found - throw 404
	error(404, {
		message: "Page not found",
	});
};
