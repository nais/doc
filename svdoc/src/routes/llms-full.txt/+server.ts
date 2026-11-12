import { contentStore } from "#lib/content-store.ts";
import { formatLlmsFull, MARKDOWN_RESPONSE_HEADERS } from "#lib/llms.ts";
import type { RequestHandler } from "./$types";

export const prerender = true;

export const GET: RequestHandler = async () => {
	const documents = await contentStore.getLlmsFullDocuments();
	return new Response(formatLlmsFull(documents), {
		headers: MARKDOWN_RESPONSE_HEADERS,
	});
};
