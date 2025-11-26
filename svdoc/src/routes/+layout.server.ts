import { contentStore } from "$lib/content-store";

export const load = async () => {
	const navigation = await contentStore.getNavigation();
	return { navigation };
};
