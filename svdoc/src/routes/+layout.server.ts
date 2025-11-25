import { buildNavigation } from "$lib/navigation";

export const load = async () => {
	const navigation = await buildNavigation();
	return { navigation };
};
