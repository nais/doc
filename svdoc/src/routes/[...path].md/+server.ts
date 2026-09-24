import { contentStore } from "$lib/content-store";
import { MARKDOWN_RESPONSE_HEADERS, serializeMarkdown } from "$lib/llms";
import { error } from "@sveltejs/kit";
import type { EntryGenerator, RequestHandler } from "./$types";

/**
 * A `.md` suffix route outranks the HTML `[...path]` route, so Markdown
 * representations remain unambiguous while retaining the site's clean URLs.
 */
export const entries: EntryGenerator = async () => {
	const paths = await contentStore.getMarkdownPaths();
	return paths.map((path) => ({ path }));
};

export const prerender = true;

export const GET: RequestHandler = async ({ params }) => {
	const urlPath = params.path === "index" ? "/" : `/${params.path}`;
	const document = await contentStore.getDocumentByPath(urlPath);
	if (!document) {
		error(404, { message: "Page not found" });
	}

	return new Response(serializeMarkdown(document.tokens), {
		headers: MARKDOWN_RESPONSE_HEADERS,
	});
};
