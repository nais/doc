import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { contentStore } from "$lib/content-store";

export const GET: RequestHandler = async () => {
	const documents = await contentStore.getSearchIndex();

	return json(documents, {
		headers: {
			"Cache-Control": "public, max-age=3600",
		},
	});
};

// Prerender this endpoint during build
export const prerender = true;
