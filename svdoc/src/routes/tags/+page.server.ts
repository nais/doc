import { contentStore } from "$lib/content-store";
import type { PageServerLoad } from "./$types";

export const prerender = true;

export const load: PageServerLoad = async () => {
	const tags = await contentStore.getAllTags();

	return {
		tags,
	};
};
