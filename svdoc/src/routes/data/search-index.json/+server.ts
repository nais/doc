import type { RequestHandler } from "./$types";
import { contentStore } from "#lib/content-store.ts";

export const GET: RequestHandler = async () => {
	const documents = await contentStore.getSearchIndex();

	return Response.json(documents, {
		headers: {
			"Cache-Control": "public, max-age=3600",
		},
	});
};

// Prerender this endpoint during build
export const prerender = true;
