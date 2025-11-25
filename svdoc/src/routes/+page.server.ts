import { readMarkdownFile } from "$lib/markdown";

export const load = async () => {
	return await readMarkdownFile("../docs/README.md");
};
