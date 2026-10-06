export function slugifyTabLabel(label: string): string {
	return (
		label
			.trim()
			.toLowerCase()
			.replaceAll("æ", "ae")
			.replaceAll("ø", "o")
			.replaceAll("å", "a")
			.normalize("NFKD")
			.replace(/[\u0300-\u036f]/g, "")
			.replace(/[^a-z0-9]+/g, "-")
			.replace(/^-+|-+$/g, "") || "tab"
	);
}

export function makeTabSlugs(labels: string[]): string[] {
	const counts = new Map<string, number>();

	return labels.map((label) => {
		const base = slugifyTabLabel(label);
		const count = counts.get(base) ?? 0;
		counts.set(base, count + 1);
		return count === 0 ? base : `${base}-${count + 1}`;
	});
}
