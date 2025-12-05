import { contentStore } from "$lib/content-store";
import { getAllRedirects, getRedirectTarget } from "$lib/redirects";
import type { Attributes } from "$lib/types/tokens";
import { error, redirect } from "@sveltejs/kit";
import type { EntryGenerator, PageServerLoad } from "./$types";

/**
 * Generate all entry points for static prerendering
 */
export const entries: EntryGenerator = async () => {
	const paths = await contentStore.getAllPaths();
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

	// Normalize the URL path
	const urlPath = !path || path === "" ? "/" : `/${path}`;

	// Try to get content from the content store
	const content = await contentStore.getContent(urlPath);

	if (content) {
		return {
			tokens: content.tokens,
			attributes: content.attributes,
		};
	}

	// Check if it's a directory without README (category page)
	// This happens when a directory has children but no README.md
	const doc = await contentStore.getDocumentByPath(urlPath);
	if (!doc) {
		// Check if there are any documents under this path (category without content)
		const allDocs = await contentStore.getAllDocuments();
		const hasChildren = allDocs.some((d) => d.urlPath.startsWith(urlPath + "/"));

		if (hasChildren) {
			// Return empty tokens - this is a category page without content
			return {
				tokens: [],
				attributes: {} as Attributes,
				isCategory: true,
			};
		}
	}

	// Check if there's a redirect for this path
	const redirectTarget = getRedirectTarget(path || "");
	if (redirectTarget) {
		redirect(307, redirectTarget);
	}

	// Nothing found - throw 404
	error(404, {
		message: "Page not found",
	});
};
