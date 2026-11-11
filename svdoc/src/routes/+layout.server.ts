import { contentStore } from "#lib/content-store.ts";

export const load = async () => {
	const navigation = await contentStore.getNavigation();
	return { navigation };
};
