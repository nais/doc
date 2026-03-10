import { contentStore } from "$lib/content-store";
import { error } from "@sveltejs/kit";
import type { PageServerLoad, EntryGenerator } from "./$types";

export const entries: EntryGenerator = async () => {
	const tags = await contentStore.getAllTags();
	return tags.map((tag) => ({ tag: tag.slug }));
};

export const prerender = true;

export const load: PageServerLoad = async ({ params }) => {
	const { tag } = params;

	const tagInfo = await contentStore.getTag(tag);

	if (!tagInfo) {
		error(404, {
			message: `Tag "${tag}" not found`,
		});
	}

	const pages = await contentStore.getTagPages(tag);

	return {
		tag: tagInfo.name,
		slug: tag,
		pages,
	};
};
