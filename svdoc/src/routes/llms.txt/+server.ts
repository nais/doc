import { contentStore } from "$lib/content-store";
import { formatLlmsIndex, MARKDOWN_RESPONSE_HEADERS } from "$lib/llms";
import type { RequestHandler } from "./$types";

export const prerender = true;

export const GET: RequestHandler = async () => {
	const documents = await contentStore.getLlmsDocuments();
	return new Response(formatLlmsIndex(documents), {
		headers: MARKDOWN_RESPONSE_HEADERS,
	});
};
