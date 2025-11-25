declare module "emoji-name-map" {
	const emojiNameMap: {
		get(name: string): string | undefined;
		emoji: Record<string, string>;
	};
	export default emojiNameMap;
}
